"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const rateLimiter_1 = require("../middleware/rateLimiter");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// POST /api/metrics/events
router.post('/events', rateLimiter_1.writeLimiter, (req, res) => {
    const { eventType, metadata } = req.body;
    if (!eventType || eventType.length > 64) {
        return res.status(400).json({ error: 'eventType is required and must be <= 64 chars' });
    }
    const db = (0, db_1.getDb)();
    db.prepare('INSERT INTO event_metrics (id, event_type, metadata) VALUES (?, ?, ?)')
        .run((0, uuid_1.v4)(), eventType, JSON.stringify(metadata ?? {}));
    res.status(201).json({ ok: true });
});
// GET /api/metrics/impact
router.get('/impact', (_req, res) => {
    const db = (0, db_1.getDb)();
    const totals = db.prepare(`
    SELECT
      SUM(CASE WHEN helped = 1 THEN 1 ELSE 0 END) AS successful,
      COUNT(*) AS totalCheckins
    FROM follow_through
  `).get();
    const eventRows = db.prepare(`
    SELECT event_type AS eventType, COUNT(*) AS count
    FROM event_metrics
    GROUP BY event_type
    ORDER BY count DESC
  `).all();
    const byChannel = db.prepare(`
    SELECT channel, COUNT(*) AS count
    FROM follow_through
    GROUP BY channel
  `).all();
    const success = totals.successful ?? 0;
    const total = totals.totalCheckins ?? 0;
    res.json({
        successfulReferrals: success,
        totalCheckins: total,
        successRate: total > 0 ? Number(((success / total) * 100).toFixed(1)) : 0,
        byChannel,
        events: eventRows,
    });
});
exports.default = router;
