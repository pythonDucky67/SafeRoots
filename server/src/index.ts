import http from 'http';
import express from 'express';
import path from 'path';
import { existsSync } from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import { Server as SocketServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

import { apiLimiter } from './middleware/rateLimiter';
import shelterRoutes   from './routes/shelterRoutes';
import resourceRoutes  from './routes/resources';
import alertRoutes     from './routes/alerts';
import volunteerRoutes from './routes/volunteers';
import metricsRoutes   from './routes/metrics';
import legalRoutes     from './routes/legal';
import authRoutes      from './routes/auth';
import transitRoutes   from './routes/transit';
import { getDb } from './db';

dotenv.config();

const PORT        = Number(process.env.PORT)        || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN         || '*';

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'ws:'],
    },
  },
}));

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '128kb' }));
app.use('/api', apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/shelters',   shelterRoutes);
app.use('/api/resources',  resourceRoutes);
app.use('/api/alerts',     alertRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/metrics',    metricsRoutes);
app.use('/api/legal',      legalRoutes);
app.use('/api/auth',       authRoutes);
app.use('/api/transit',    transitRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 catch-all
// Serve client static files when available (production build)
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // SPA fallback — only for non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 catch-all for API routes / when client not present
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── HTTP + Socket.io ─────────────────────────────────────────────────────────

const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: { origin: CORS_ORIGIN, methods: ['GET', 'POST'] },
});

const VALID_ROOMS = new Set([
  'general', 'housing', 'lgbtq', 'mental-health', 'legal', 'domestic-violence', 'women',
]);

/** Maximum history lines returned per room */
const HISTORY_LIMIT = 50;

io.on('connection', socket => {
  let currentRoom: string | null = null;

  socket.on('join-room', (room: unknown) => {
    if (typeof room !== 'string' || !VALID_ROOMS.has(room)) return;

    currentRoom = room;
    socket.join(room);

    // Send last N messages from DB
    const db   = getDb();
    const rows = db
      .prepare(
        `SELECT id, room, username, message, timestamp
         FROM chat_messages
         WHERE room = ?
         ORDER BY timestamp DESC
         LIMIT ?`
      )
      .all(room, HISTORY_LIMIT) as {
        id: string; room: string; username: string;
        message: string; timestamp: string;
      }[];

    socket.emit('chat-history', rows.reverse());
  });

  socket.on('leave-room', (room: unknown) => {
    if (typeof room === 'string') socket.leave(room);
  });

  socket.on('chat-message', (payload: unknown) => {
    if (
      typeof payload !== 'object' || payload === null ||
      !('room' in payload) || !('message' in payload) || !('username' in payload)
    ) return;

    const { room, message, username } = payload as {
      room: unknown; message: unknown; username: unknown;
    };

    if (
      typeof room     !== 'string' || !VALID_ROOMS.has(room) ||
      typeof message  !== 'string' || !message.trim() || message.length > 500 ||
      typeof username !== 'string' || !username.trim() || username.length > 60
    ) return;

    const db = getDb();
    const id        = uuidv4();
    const timestamp = new Date().toISOString();

    // Persist to DB
    db.prepare(
      'INSERT INTO chat_messages (id, room, username, message, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).run(id, room, username.trim(), message.trim(), timestamp);

    const msg = { id, room, username: username.trim(), message: message.trim(), timestamp };

    // Broadcast to everyone in the room (including sender)
    io.to(room).emit('chat-message', msg);
  });

  socket.on('disconnect', () => {
    if (currentRoom) socket.leave(currentRoom);
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`🛡  SafeRoots API running on http://localhost:${PORT}`);
});
