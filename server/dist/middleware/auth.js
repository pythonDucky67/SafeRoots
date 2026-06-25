"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAuthToken = signAuthToken;
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? 'saferoots-dev-jwt-secret';
function signAuthToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}
function parseToken(header) {
    if (!header)
        return null;
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token)
        return null;
    return token;
}
function requireAuth(req, res, next) {
    const token = parseToken(req.header('authorization'));
    if (!token)
        return res.status(401).json({ error: 'Missing bearer token.' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.auth = decoded;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        const token = parseToken(req.header('authorization'));
        if (!token)
            return res.status(401).json({ error: 'Missing bearer token.' });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ error: 'Insufficient permissions.' });
            }
            req.auth = decoded;
            return next();
        }
        catch {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }
    };
}
