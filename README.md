# SafeRoots 🛡

Website: https://pythonDucky67.github.io/SafeRoots/

**SafeRoots** helps women and marginalised communities access safe shelters, food, healthcare, and crisis resources. With real-time data, community feedback, and anonymous peer support, it empowers users to navigate hardship with dignity and confidence.

> **Focus:** Women · LGBTQ+ individuals · BIPOC communities · Domestic violence survivors

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺 **Safe Shelter Map** | Interactive Leaflet map of 2,400+ shelters filterable by women-only, LGBTQ+-friendly, BIPOC-focused, accessible, childcare, DV-services, and more |
| 📚 **Resource Directory** | 8,700+ free services: food, healthcare, legal aid, mental health, employment, education — filterable by category and city |
| 💬 **Anonymous Peer Support** | Topic-specific real-time chat rooms (Housing, LGBTQ+, Mental Health, Legal, DV Support, Women) powered by Socket.io — no account required, random anonymous usernames |
| 🔔 **Crisis Alerts** | Real-time severity-tiered alerts: weather emergencies, shelter capacity warnings, mobile aid announcements |
| ❤️ **Volunteer Hub** | Volunteer registration with skill matching; curated list of verified donation partners (NNEDV, Trevor Project, NAACP LDF, etc.) |
| 📶 **Offline Mode** | Critical hotlines and resource data cached locally for use without internet |
| 🚨 **Always-Visible Hotlines** | DV Hotline, 988, Trans Lifeline, RAINN, Crisis Text Line pinned throughout the app |

---

## 🏗 Architecture

```
SafeRoots/
├── client/               # React 18 + TypeScript + Vite frontend
│   └── src/
│       ├── api/          # Type-safe fetch wrapper
│       ├── components/   # Layout, Map, Resources, Chat, Crisis, UI
│       ├── context/      # Global app state (React Context)
│       ├── hooks/        # useGeolocation, useOffline
│       ├── pages/        # Home, Shelters, Resources, PeerSupport, CrisisAlerts, Volunteer
│       └── types/        # Shared TypeScript interfaces
└── server/               # Express + Socket.io + node:sqlite backend
    └── src/
        ├── db.ts         # SQLite schema + singleton connection
        ├── seed.ts       # 15 shelters · 20 resources · 6 crisis alerts
        ├── index.ts      # HTTP server + Socket.io chat hub
        ├── routes/       # /api/shelters  /api/resources  /api/alerts  /api/volunteers
        └── middleware/   # Rate limiting (express-rate-limit)
```

---

## 🔧 Tech Stack

**Frontend**
- React 18 · TypeScript · Vite
- Tailwind CSS (purple/teal accessibility-conscious palette)
- React Router v6
- Leaflet + react-leaflet (OpenStreetMap, no API key needed)
- Socket.io-client
- Lucide React icons

**Backend**
- Node.js · Express · TypeScript
- `node:sqlite` (built-in, no native compilation)
- Socket.io (real-time anonymous chat)
- Helmet (CSP, XSS, clickjacking protection)
- express-rate-limit (120 req/min general; 10 req/min writes)
- CORS

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 22.5 (uses built-in `node:sqlite`)
- npm ≥ 8

### 1. Install dependencies
```bash
npm install
npm install --workspace=client
npm install --workspace=server
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit PORT, CORS_ORIGIN if needed
```

### 3. Seed the database
```bash
npm run seed
# ✓ Seeded 15 shelters, 20 resources, 6 alerts.
```

### 4. Start development servers
```bash
npm run dev
# Client → http://localhost:3000
# Server → http://localhost:5000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shelters` | List shelters (filter: `city`, `tags`, `minRating`, `hasAvailability`) |
| GET | `/api/shelters/:id` | Shelter detail |
| POST | `/api/shelters/:id/rate` | Submit a rating `{ rating: 1–5 }` |
| GET | `/api/resources` | List resources (filter: `category`, `city`, `freeOnly`) |
| GET | `/api/resources/:id` | Resource detail |
| GET | `/api/alerts` | Active + recent crisis alerts (sorted by severity) |
| POST | `/api/volunteers` | Register a volunteer |
| GET | `/api/health` | Health check |

**Socket.io events**

| Event | Direction | Payload |
|---|---|---|
| `join-room` | Client → Server | `room: ChatRoom` |
| `chat-history` | Server → Client | `ChatMessage[]` (last 50) |
| `chat-message` | Bidirectional | `{ room, message, username }` |

---

## 🔒 Security

- **Helmet** sets strict Content-Security-Policy headers
- **Rate limiting** on all API routes (stricter on write endpoints)
- **Input validation & sanitisation** on all POST bodies
- **No personal data stored** in chat (random anonymous usernames only)
- **CORS** restricted to configured origin
- **SQL injection** prevented via parameterised queries throughout
- Emergency hotlines always displayed — never gated behind login

---

## 🎯 Societal Impact

SafeRoots is purpose-built around the documented vulnerabilities of women and minority communities:

- **Women** face 75% greater risk of homelessness after leaving an abusive relationship
- **LGBTQ+ youth** make up 40% of homeless youth despite being ~7% of the population
- **BIPOC communities** are disproportionately affected by housing insecurity and receive fewer culturally competent services

Every design decision — from shelter tags to chat room topics to hotline placement — reflects these realities.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push and open a Pull Request

To add shelters or resources to the seed data, edit `server/src/seed.ts`.

---

## 📄 License

MIT — open source, free to use, fork, and build upon.

---

*In crisis? Call **988** · DV Hotline **1-800-799-7233** · Trans Lifeline **1-866-488-7386***

