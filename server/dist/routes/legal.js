"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
const FALLBACK_FLOW = {
    issue: 'lost-id',
    city: 'National',
    title: 'I lost my ID',
    steps: [
        'Go to nearest legal aid or homeless services intake center.',
        'Request a replacement birth certificate or state ID voucher.',
        'Use shelter letter + intake records as interim identity proof.',
        'Apply for replacement ID at DMV with fee waiver if eligible.',
    ],
    resources: [
        { name: 'Legal Aid Society', type: 'legal-aid' },
        { name: 'DMV Outreach Desk', type: 'government' },
        { name: 'Shelter Intake Office', type: 'shelter' },
    ],
};
// GET /api/legal/flow
router.get('/flow', (req, res) => {
    const issue = typeof req.query.issue === 'string' ? req.query.issue : 'lost-id';
    const city = typeof req.query.city === 'string' ? req.query.city : 'National';
    const db = (0, db_1.getDb)();
    const row = db.prepare(`
    SELECT * FROM legal_help_flows
    WHERE issue = ? AND (city = ? OR city = 'National')
    ORDER BY CASE WHEN city = ? THEN 1 ELSE 2 END
    LIMIT 1
  `).get(issue, city, city);
    if (!row)
        return res.json(FALLBACK_FLOW);
    res.json({
        issue: row.issue,
        city: row.city,
        title: row.title,
        steps: JSON.parse(row.steps ?? '[]'),
        resources: JSON.parse(row.resources ?? '[]'),
    });
});
exports.default = router;
