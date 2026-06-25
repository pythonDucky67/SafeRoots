"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_1 = require("crypto");
const uuid_1 = require("uuid");
const db_1 = require("../db");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function hashPassword(password) {
    const salt = (0, crypto_1.randomBytes)(16).toString('hex');
    const hash = (0, crypto_1.scryptSync)(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
    const [salt, storedHash] = stored.split(':');
    if (!salt || !storedHash)
        return false;
    const hash = (0, crypto_1.scryptSync)(password, salt, 64);
    const buffer = Buffer.from(storedHash, 'hex');
    if (buffer.length !== hash.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(buffer, hash);
}
// POST /api/auth/register-outreach
router.post('/register-outreach', rateLimiter_1.writeLimiter, (req, res) => {
    const inviteCode = process.env.OUTREACH_INVITE_CODE ?? 'saferoots-outreach';
    const { email, password, name, role, invite } = req.body;
    if (!email || !password || !name || !invite) {
        return res.status(400).json({ error: 'email, password, name and invite are required.' });
    }
    if (invite !== inviteCode) {
        return res.status(403).json({ error: 'Invalid invite code.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }
    const db = (0, db_1.getDb)();
    const safeRole = role === 'admin' ? 'admin' : 'outreach';
    try {
        db.prepare(`
      INSERT INTO outreach_users (id, email, password_hash, role, name)
      VALUES (?, ?, ?, ?, ?)
    `).run((0, uuid_1.v4)(), email.toLowerCase().trim(), hashPassword(password), safeRole, name.slice(0, 80));
    }
    catch (err) {
        if (err instanceof Error && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Email already registered.' });
        }
        throw err;
    }
    return res.status(201).json({ ok: true });
});
// POST /api/auth/login
router.post('/login', rateLimiter_1.writeLimiter, (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required.' });
    }
    const db = (0, db_1.getDb)();
    const user = db.prepare(`
    SELECT id, email, password_hash, role, name
    FROM outreach_users
    WHERE email = ?
  `).get(email.toLowerCase().trim());
    if (!user || !verifyPassword(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = (0, auth_1.signAuthToken)({
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
    });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});
// GET /api/auth/me
router.get('/me', auth_1.requireAuth, (req, res) => {
    const auth = req.auth;
    if (!auth)
        return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user: { id: auth.sub, email: auth.email, role: auth.role, name: auth.name } });
});
exports.default = router;
