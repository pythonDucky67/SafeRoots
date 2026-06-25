"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const rateLimiter_1 = require("../middleware/rateLimiter");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// POST /api/volunteers
router.post('/', rateLimiter_1.writeLimiter, (req, res) => {
    const { name, email, city, phone, organization, skills, availability } = req.body;
    // Validate required fields
    if (!name || !email || !city || !availability) {
        return res.status(400).json({ error: 'name, email, city, and availability are required.' });
    }
    // Basic email format check (not a substitute for real verification)
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }
    // Sanitise string fields
    const safeName = String(name).slice(0, 120);
    const safeEmail = String(email).toLowerCase().trim().slice(0, 254);
    const safeCity = String(city).slice(0, 100);
    const safeAvail = String(availability).slice(0, 50);
    const safeOrg = organization ? String(organization).slice(0, 200) : null;
    const safePhone = phone ? String(phone).slice(0, 30) : null;
    const safeSkills = Array.isArray(skills)
        ? JSON.stringify(skills.map((s) => String(s).slice(0, 100)).slice(0, 20))
        : '[]';
    const db = (0, db_1.getDb)();
    const id = (0, uuid_1.v4)();
    try {
        db.prepare(`
      INSERT INTO volunteers (id, name, email, city, phone, organization, skills, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, safeName, safeEmail, safeCity, safePhone, safeOrg, safeSkills, safeAvail);
    }
    catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'This email address is already registered.' });
        }
        throw err;
    }
    return res.status(201).json({ id });
});
exports.default = router;
