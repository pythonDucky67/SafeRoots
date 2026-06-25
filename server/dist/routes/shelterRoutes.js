"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const rateLimiter_1 = require("../middleware/rateLimiter");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
function toIso(input) {
    if (typeof input === 'string' && input.trim())
        return input;
    return new Date().toISOString();
}
function asNumber(input, fallback) {
    const n = Number(input);
    return Number.isFinite(n) ? n : fallback;
}
function parseShelter(row) {
    const safety = {
        women: asNumber(row.women_safety_score, 4.3),
        lgbtq: asNumber(row.lgbtq_safety_score, 4.2),
        antiRacism: asNumber(row.anti_racism_score, 4.1),
    };
    return {
        id: row.id,
        name: row.name,
        address: row.address,
        city: row.city,
        state: row.state,
        lat: asNumber(row.lat, 0),
        lng: asNumber(row.lng, 0),
        phone: row.phone,
        website: row.website ?? null,
        tags: JSON.parse(row.tags ?? '[]'),
        capacity: asNumber(row.capacity, 0),
        currentOccupancy: asNumber(row.current_occupancy, 0),
        bedsAvailable: Math.max(0, asNumber(row.capacity, 0) - asNumber(row.current_occupancy, 0)),
        availabilityUpdatedAt: toIso(row.last_bed_update_at),
        rating: asNumber(row.rating, 0),
        reviewCount: asNumber(row.review_count, 0),
        services: JSON.parse(row.services ?? '[]'),
        hours: row.hours,
        description: row.description,
        safetyScores: safety,
    };
}
function haversineMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function minutesAgo(iso) {
    const delta = Date.now() - new Date(iso).getTime();
    return Math.max(0, Math.floor(delta / 60000));
}
// GET /api/shelters
router.get('/', (req, res) => {
    const db = (0, db_1.getDb)();
    const { city, tags, minRating, hasAvailability } = req.query;
    let sql = 'SELECT * FROM shelters WHERE 1=1';
    const params = [];
    if (city && typeof city === 'string') {
        sql += ' AND lower(city) LIKE ?';
        params.push(`%${city.toLowerCase()}%`);
    }
    if (minRating) {
        sql += ' AND rating >= ?';
        params.push(Number(minRating));
    }
    if (hasAvailability === 'true') {
        sql += ' AND current_occupancy < capacity';
    }
    sql += ' ORDER BY (capacity - current_occupancy) DESC, rating DESC';
    const rows = db.prepare(sql).all(...params);
    let shelters = rows.map(parseShelter);
    if (tags && typeof tags === 'string') {
        const wanted = tags.split(',').map(t => t.trim()).filter(Boolean);
        shelters = shelters.filter(shelter => wanted.every(tag => shelter.tags.includes(tag)));
    }
    res.json(shelters);
});
// GET /api/shelters/recommendations
router.get('/recommendations', (req, res) => {
    const db = (0, db_1.getDb)();
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const requestedTags = typeof req.query.tags === 'string'
        ? req.query.tags.split(',').map(v => v.trim()).filter(Boolean)
        : [];
    const rows = db.prepare('SELECT * FROM shelters').all();
    const enriched = rows.map(parseShelter).map(shelter => {
        const distanceMiles = Number.isFinite(lat) && Number.isFinite(lng)
            ? haversineMiles(lat, lng, shelter.lat, shelter.lng)
            : 10;
        const hasAvailability = shelter.bedsAvailable > 0;
        const freshnessMinutes = minutesAgo(shelter.availabilityUpdatedAt);
        const fitBonus = requestedTags.length === 0
            ? 0
            : requestedTags.filter(tag => shelter.tags.includes(tag)).length * 2;
        const score = (hasAvailability ? 30 : -20) +
            Math.max(0, 20 - distanceMiles * 2) +
            Math.max(0, 15 - freshnessMinutes / 10) +
            shelter.rating * 5 +
            fitBonus;
        const reasons = [
            hasAvailability ? `${shelter.bedsAvailable} beds open now` : 'currently full',
            `${distanceMiles.toFixed(1)} mi away`,
            `availability updated ${freshnessMinutes}m ago`,
            requestedTags.length ? `matches ${requestedTags.filter(tag => shelter.tags.includes(tag)).length} requested tags` : 'high community rating',
        ];
        return { ...shelter, recommendationScore: Number(score.toFixed(1)), recommendationReasons: reasons };
    });
    enriched.sort((a, b) => b.recommendationScore - a.recommendationScore);
    res.json(enriched.slice(0, 8));
});
// GET /api/shelters/:id
router.get('/:id', (req, res) => {
    const db = (0, db_1.getDb)();
    const row = db.prepare('SELECT * FROM shelters WHERE id = ?').get(req.params.id);
    if (!row)
        return res.status(404).json({ error: 'Shelter not found' });
    return res.json(parseShelter(row));
});
// POST /api/shelters/:id/rate
router.post('/:id/rate', rateLimiter_1.writeLimiter, (req, res) => {
    const { rating } = req.body;
    const value = Number(rating);
    if (!value || value < 1 || value > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    const db = (0, db_1.getDb)();
    const shelter = db
        .prepare('SELECT rating, review_count FROM shelters WHERE id = ?')
        .get(req.params.id);
    if (!shelter)
        return res.status(404).json({ error: 'Shelter not found' });
    const newCount = shelter.review_count + 1;
    const newRating = ((shelter.rating * shelter.review_count) + value) / newCount;
    db.prepare('UPDATE shelters SET rating = ?, review_count = ? WHERE id = ?')
        .run(Math.round(newRating * 10) / 10, newCount, req.params.id);
    return res.json({ ok: true, rating: Math.round(newRating * 10) / 10 });
});
// POST /api/shelters/:id/feedback
router.post('/:id/feedback', rateLimiter_1.writeLimiter, (req, res) => {
    const { feltSafe, womenSafetyScore, lgbtqSafetyScore, antiRacismScore, comment, } = req.body;
    const ws = asNumber(womenSafetyScore, NaN);
    const ls = asNumber(lgbtqSafetyScore, NaN);
    const ars = asNumber(antiRacismScore, NaN);
    if (![ws, ls, ars].every(score => score >= 1 && score <= 5)) {
        return res.status(400).json({ error: 'All safety scores must be between 1 and 5.' });
    }
    const db = (0, db_1.getDb)();
    const shelter = db.prepare('SELECT id FROM shelters WHERE id = ?').get(req.params.id);
    if (!shelter)
        return res.status(404).json({ error: 'Shelter not found' });
    db.prepare(`
    INSERT INTO shelter_feedback (id, shelter_id, felt_safe, women_safety_score, lgbtq_safety_score, anti_racism_score, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), req.params.id, feltSafe === false ? 0 : 1, ws, ls, ars, (comment ?? '').slice(0, 500));
    const avg = db.prepare(`
    SELECT
      AVG(women_safety_score) AS women,
      AVG(lgbtq_safety_score) AS lgbtq,
      AVG(anti_racism_score) AS anti,
      COUNT(*) AS total
    FROM shelter_feedback
    WHERE shelter_id = ?
  `).get(req.params.id);
    db.prepare(`
    UPDATE shelters
    SET women_safety_score = ?, lgbtq_safety_score = ?, anti_racism_score = ?
    WHERE id = ?
  `).run(avg.women, avg.lgbtq, avg.anti, req.params.id);
    return res.status(201).json({
        ok: true,
        scores: {
            women: Number(avg.women.toFixed(2)),
            lgbtq: Number(avg.lgbtq.toFixed(2)),
            antiRacism: Number(avg.anti.toFixed(2)),
            total: avg.total,
        },
    });
});
// POST /api/shelters/:id/checkin
router.post('/:id/checkin', rateLimiter_1.writeLimiter, (req, res) => {
    const { helped, notes } = req.body;
    if (typeof helped !== 'boolean') {
        return res.status(400).json({ error: 'helped boolean is required' });
    }
    const db = (0, db_1.getDb)();
    const shelter = db.prepare('SELECT id FROM shelters WHERE id = ?').get(req.params.id);
    if (!shelter)
        return res.status(404).json({ error: 'Shelter not found' });
    db.prepare(`
    INSERT INTO follow_through (id, shelter_id, helped, channel, notes)
    VALUES (?, ?, ?, ?, ?)
  `).run((0, uuid_1.v4)(), req.params.id, helped ? 1 : 0, 'shelter', (notes ?? '').slice(0, 500));
    res.status(201).json({ ok: true });
});
exports.default = router;
