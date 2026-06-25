"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
function asNumber(input, fallback) {
    const n = Number(input);
    return Number.isFinite(n) ? n : fallback;
}
function parseEssentials(raw) {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : {};
    return {
        food: Boolean(parsed.food),
        shower: Boolean(parsed.shower),
        restroom: Boolean(parsed.restroom),
        charging: Boolean(parsed.charging),
        laundry: Boolean(parsed.laundry),
    };
}
function parseResource(row) {
    const closesAt = typeof row.closes_at === 'string' ? row.closes_at : null;
    const closeMinutes = closesAt
        ? Math.floor((new Date(closesAt).getTime() - Date.now()) / 60000)
        : null;
    return {
        id: row.id,
        name: row.name,
        category: row.category,
        description: row.description,
        address: row.address,
        city: row.city,
        state: row.state,
        phone: row.phone,
        website: row.website ?? null,
        hours: row.hours,
        tags: JSON.parse(row.tags ?? '[]'),
        lat: asNumber(row.lat, 0),
        lng: asNumber(row.lng, 0),
        isFree: row.is_free === 1 || row.is_free === true,
        liveStatus: typeof row.live_status === 'string' ? row.live_status : 'open',
        statusUpdatedAt: typeof row.status_updated_at === 'string' ? row.status_updated_at : new Date().toISOString(),
        closesAt,
        essentials: parseEssentials(row.essentials),
        closingSoon: closeMinutes !== null && closeMinutes >= 0 && closeMinutes <= 60,
    };
}
function essentialsFilterSql(req) {
    const fields = ['food', 'shower', 'restroom', 'charging', 'laundry'];
    const clauses = [];
    for (const field of fields) {
        if (req.query[field] === 'true') {
            clauses.push(`json_extract(essentials, '$.${field}') = 1`);
        }
    }
    return clauses;
}
// GET /api/resources
router.get('/', (req, res) => {
    const db = (0, db_1.getDb)();
    const { category, city, freeOnly, openNow } = req.query;
    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params = [];
    if (category && typeof category === 'string') {
        sql += ' AND category = ?';
        params.push(category);
    }
    if (city && typeof city === 'string') {
        sql += ' AND lower(city) LIKE ?';
        params.push(`%${city.toLowerCase()}%`);
    }
    if (freeOnly === 'true') {
        sql += ' AND is_free = 1';
    }
    if (openNow === 'true') {
        sql += " AND live_status IN ('open','limited')";
    }
    for (const clause of essentialsFilterSql(req)) {
        sql += ` AND ${clause}`;
    }
    sql += " ORDER BY CASE live_status WHEN 'open' THEN 1 WHEN 'limited' THEN 2 WHEN 'full' THEN 3 ELSE 4 END, name ASC";
    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(parseResource));
});
// GET /api/resources/live
router.get('/live', (_req, res) => {
    const db = (0, db_1.getDb)();
    const rows = db.prepare('SELECT * FROM resources ORDER BY status_updated_at DESC').all();
    const popups = db.prepare(`
    SELECT * FROM outreach_popups
    WHERE datetime(ends_at) >= datetime('now')
    ORDER BY starts_at ASC
  `).all();
    res.json({
        resources: rows.map(parseResource),
        popups: popups.map(p => ({
            id: p.id,
            title: p.title,
            type: p.type,
            city: p.city,
            address: p.address,
            lat: asNumber(p.lat, 0),
            lng: asNumber(p.lng, 0),
            startsAt: p.starts_at,
            endsAt: p.ends_at,
            services: JSON.parse(p.services ?? '[]'),
            verifiedBy: p.verified_by,
        })),
    });
});
// POST /api/resources/:id/live-status
router.post('/:id/live-status', rateLimiter_1.writeLimiter, (0, auth_1.requireRole)(['outreach', 'admin']), (req, res) => {
    const { status, essentials, closesAt, note, verifier } = req.body;
    const validStatus = ['open', 'limited', 'full', 'closed'];
    if (!status || !validStatus.includes(status)) {
        return res.status(400).json({ error: 'status must be open|limited|full|closed' });
    }
    const safeEssentials = {
        food: Boolean(essentials?.food),
        shower: Boolean(essentials?.shower),
        restroom: Boolean(essentials?.restroom),
        charging: Boolean(essentials?.charging),
        laundry: Boolean(essentials?.laundry),
    };
    const db = (0, db_1.getDb)();
    const exists = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.id);
    if (!exists)
        return res.status(404).json({ error: 'Resource not found' });
    const nowIso = new Date().toISOString();
    db.prepare(`
    UPDATE resources
    SET live_status = ?, status_updated_at = ?, closes_at = ?, essentials = ?
    WHERE id = ?
  `).run(status, nowIso, closesAt ?? null, JSON.stringify(safeEssentials), req.params.id);
    db.prepare(`
    INSERT INTO resource_live_status (id, resource_id, status, essentials, closes_at, updated_at, verified_by, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), req.params.id, status, JSON.stringify(safeEssentials), closesAt ?? null, nowIso, (verifier ?? 'verified-volunteer').slice(0, 80), (note ?? '').slice(0, 300));
    res.status(201).json({ ok: true, updatedAt: nowIso });
});
// POST /api/resources/popups
router.post('/popups', rateLimiter_1.writeLimiter, (0, auth_1.requireRole)(['outreach', 'admin']), (req, res) => {
    const { title, type, city, address, lat, lng, startsAt, endsAt, services, verifier } = req.body;
    if (!title || !type || !city || !address || !startsAt || !endsAt) {
        return res.status(400).json({ error: 'title, type, city, address, startsAt, endsAt are required.' });
    }
    const db = (0, db_1.getDb)();
    db.prepare(`
    INSERT INTO outreach_popups (id, title, type, city, address, lat, lng, starts_at, ends_at, services, verified_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), title.slice(0, 120), type.slice(0, 40), city.slice(0, 80), address.slice(0, 200), asNumber(lat, 0), asNumber(lng, 0), startsAt, endsAt, JSON.stringify((services ?? []).slice(0, 12)), (verifier ?? 'verified-volunteer').slice(0, 80));
    res.status(201).json({ ok: true });
});
// POST /api/resources/:id/checkin
router.post('/:id/checkin', rateLimiter_1.writeLimiter, (req, res) => {
    const { helped, notes } = req.body;
    if (typeof helped !== 'boolean') {
        return res.status(400).json({ error: 'helped boolean is required' });
    }
    const db = (0, db_1.getDb)();
    const resource = db.prepare('SELECT id FROM resources WHERE id = ?').get(req.params.id);
    if (!resource)
        return res.status(404).json({ error: 'Resource not found' });
    db.prepare(`
    INSERT INTO follow_through (id, resource_id, helped, channel, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), req.params.id, helped ? 1 : 0, 'resource', (notes ?? '').slice(0, 500));
    res.status(201).json({ ok: true });
});
// GET /api/resources/:id
router.get('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(req.params.id);
    if (!row)
        return res.status(404).json({ error: 'Resource not found' });
    return res.json(parseResource(row));
});
exports.default = router;
