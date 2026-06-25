"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// GET /api/alerts
router.get('/', (_req, res) => {
    const db = (0, db_1.getDb)();
    const rows = db
        .prepare(`SELECT id, type, title, description, city, expires_at, severity, created_at
       FROM crisis_alerts
       ORDER BY
         CASE severity
           WHEN 'critical' THEN 1
           WHEN 'high'     THEN 2
           WHEN 'medium'   THEN 3
           ELSE 4
         END,
         created_at DESC`)
        .all();
    const alerts = rows.map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        city: row.city ?? null,
        expiresAt: row.expires_at,
        severity: row.severity,
        createdAt: row.created_at,
    }));
    res.json(alerts);
});
exports.default = router;
