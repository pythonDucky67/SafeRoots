"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const rateLimiter_1 = require("./middleware/rateLimiter");
const shelterRoutes_1 = __importDefault(require("./routes/shelterRoutes"));
const resources_1 = __importDefault(require("./routes/resources"));
const alerts_1 = __importDefault(require("./routes/alerts"));
const volunteers_1 = __importDefault(require("./routes/volunteers"));
const metrics_1 = __importDefault(require("./routes/metrics"));
const legal_1 = __importDefault(require("./routes/legal"));
const auth_1 = __importDefault(require("./routes/auth"));
const transit_1 = __importDefault(require("./routes/transit"));
const db_1 = require("./db");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
// ─── Express app ─────────────────────────────────────────────────────────────
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'wss:', 'ws:'],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '128kb' }));
app.use('/api', rateLimiter_1.apiLimiter);
// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/shelters', shelterRoutes_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/alerts', alerts_1.default);
app.use('/api/volunteers', volunteers_1.default);
app.use('/api/metrics', metrics_1.default);
app.use('/api/legal', legal_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/transit', transit_1.default);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
// 404 catch-all
// Serve client static files when available (production build)
const clientDist = path_1.default.join(__dirname, '..', '..', 'client', 'dist');
if ((0, fs_1.existsSync)(clientDist)) {
    app.use(express_1.default.static(clientDist));
    // SPA fallback — only for non-API routes
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api'))
            return next();
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
// 404 catch-all for API routes / when client not present
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    res.status(500).json({ error: 'Internal server error' });
});
// ─── HTTP + Socket.io ─────────────────────────────────────────────────────────
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});
const VALID_ROOMS = new Set([
    'general', 'housing', 'lgbtq', 'mental-health', 'legal', 'domestic-violence', 'women',
]);
/** Maximum history lines returned per room */
const HISTORY_LIMIT = 50;
io.on('connection', socket => {
    let currentRoom = null;
    socket.on('join-room', (room) => {
        if (typeof room !== 'string' || !VALID_ROOMS.has(room))
            return;
        currentRoom = room;
        socket.join(room);
        // Send last N messages from DB
        const db = (0, db_1.getDb)();
        const rows = db
            .prepare(`SELECT id, room, username, message, timestamp
         FROM chat_messages
         WHERE room = ?
         ORDER BY timestamp DESC
         LIMIT ?`)
            .all(room, HISTORY_LIMIT);
        socket.emit('chat-history', rows.reverse());
    });
    socket.on('leave-room', (room) => {
        if (typeof room === 'string')
            socket.leave(room);
    });
    socket.on('chat-message', (payload) => {
        if (typeof payload !== 'object' || payload === null ||
            !('room' in payload) || !('message' in payload) || !('username' in payload))
            return;
        const { room, message, username } = payload;
        if (typeof room !== 'string' || !VALID_ROOMS.has(room) ||
            typeof message !== 'string' || !message.trim() || message.length > 500 ||
            typeof username !== 'string' || !username.trim() || username.length > 60)
            return;
        const db = (0, db_1.getDb)();
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        // Persist to DB
        db.prepare('INSERT INTO chat_messages (id, room, username, message, timestamp) VALUES (?, ?, ?, ?, ?)').run(id, room, username.trim(), message.trim(), timestamp);
        const msg = { id, room, username: username.trim(), message: message.trim(), timestamp };
        // Broadcast to everyone in the room (including sender)
        io.to(room).emit('chat-message', msg);
    });
    socket.on('disconnect', () => {
        if (currentRoom)
            socket.leave(currentRoom);
    });
});
// ─── Start ───────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
    console.log(`🛡  SafeRoots API running on http://localhost:${PORT}`);
});
