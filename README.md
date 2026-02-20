# 🎮 HexQuiz / هيكس الألغاز

A production-ready **bilingual (Arabic + English)** multiplayer trivia game built on a hexagonal grid, where two teams compete to connect a path by answering questions. Built with Next.js, Socket.IO, Prisma, and TailwindCSS.

---

## ✨ Features

### Gameplay
- **Hex Grid Board** — 7×7 / 9×9 / 11×11 with Arabic or English letters as hints
- **Two Teams**: Red (connect horizontally) vs Blue (connect vertically)  
- **Live Path Detection** — Win detection via BFS on the hex grid
- **Two Game Modes**: Buzz-in or Turn-based
- **Timer Ring** — Animated countdown per question

### Host Controls
- Create rooms with full settings (board size, language, difficulty, timer, mode)
- Select cells → auto-fetch matching unused questions
- Mark answers correct/incorrect/skip
- See answers on-demand
- Assign players to teams
- Reset game, play again

### Question Bank (Admin)
- Full CRUD with bilingual fields (AR + EN questions + answers)
- Filter by **Used / Unused / All** with visual indicators
- Used count tracking (per session + historically)
- Import JSON / Export JSON & CSV
- Category, difficulty, first-letter tags

### Bilingual & RTL
- Arabic UI with Cairo font, full RTL layout
- English UI with DM Sans
- Language switcher on every screen
- Game language controls which questions/letters appear

### Multiplayer
- Room codes (6 chars) + QR codes for join links
- Socket.IO real-time sync across all clients
- Lobby with team selection
- Players can self-join teams or host assigns
- Presenter Mode (TV display) with larger board + question

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + React + TypeScript |
| Styling | TailwindCSS + custom animations |
| Real-time | Socket.IO (Node/Express server) |
| State | Zustand |
| Database | SQLite (Prisma ORM) — swap to Postgres with 1 line |
| Auth | JWT (cookie-based) + bcrypt |
| QR | `qrcode` npm package |
| Fonts | Cairo (Arabic) + DM Sans (English) via Google Fonts |

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone & Install
```bash
git clone <repo-url>
cd hexgame
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env — defaults work for local dev:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-secret-here"
# NEXT_PUBLIC_APP_URL="http://localhost:3000"
# NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
# SOCKET_PORT=3001
```

### 3. Set Up Database
```bash
# Generate Prisma client
npm run db:generate

# Create SQLite database and tables
npm run db:push

# Seed with demo host + 60 questions
npm run db:seed
```

### 4. Run Development Servers
```bash
# Runs Next.js (port 3000) + Socket.IO (port 3001) concurrently
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Email**: `demo@hexgame.com`  
- **Password**: `demo1234`

---

## 🎯 How to Play

1. **Host** goes to `/host`, logs in, configures settings, creates a room
2. **Players** join via the 6-character room code at the homepage, or scan the QR
3. Everyone picks a team (Red or Blue)
4. Host clicks **Start Game**
5. Host clicks any unowned hex cell → a question appears
6. Players **Buzz In** (buzz mode) or host picks a team (turn mode)
7. Host marks **Correct** (cell captured by team) or **Incorrect/Skip**
8. **Blue wins** by connecting top ↔ bottom row with blue cells
9. **Red wins** by connecting left ↔ right column with red cells

---

## 🗂 Project Structure

```
hexgame/
├── server/
│   └── index.js              # Socket.IO + Express server
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.js                # 60+ bilingual seed questions
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page (join/host)
│   │   ├── host/page.tsx      # Room creation + settings
│   │   ├── admin/page.tsx     # Question bank management
│   │   ├── join/[code]/page.tsx  # Join room + team select
│   │   ├── game/[code]/page.tsx  # Main game screen
│   │   └── api/
│   │       ├── auth/login/    # JWT auth
│   │       ├── auth/register/ # Registration
│   │       ├── rooms/         # Room management (proxied to socket server)
│   │       ├── questions/     # CRUD + import/export
│   │       └── qr/            # QR code generation
│   ├── components/
│   │   ├── HexBoard.tsx       # SVG hex grid
│   │   ├── QuestionPanel.tsx  # Q&A + buzz/answer controls
│   │   ├── LobbyView.tsx      # Pre-game lobby
│   │   ├── WinScreen.tsx      # Victory screen with confetti
│   │   ├── PresenterMode.tsx  # TV/projector display
│   │   ├── PlayerPanel.tsx    # Team member list
│   │   ├── QuestionHistoryPanel.tsx  # Asked questions log
│   │   ├── QRCodePanel.tsx    # QR code display
│   │   └── TimerRing.tsx      # Animated countdown
│   ├── hooks/
│   │   └── useSocket.ts       # Socket.IO client hook
│   ├── store/
│   │   └── gameStore.ts       # Zustand global state
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── lib/
│       ├── prisma.ts          # Prisma singleton
│       ├── auth.ts            # JWT + bcrypt utilities
│       └── i18n.ts            # Bilingual translations
└── README.md
```

---

## 🌐 How to Deploy

### Option A: Vercel (Frontend) + Railway (Socket Server)

**Frontend (Vercel)**:
```bash
# Set environment variables in Vercel dashboard:
# DATABASE_URL=<your-postgres-url>
# JWT_SECRET=<your-secret>
# NEXT_PUBLIC_SOCKET_URL=<your-socket-server-url>
# NEXT_PUBLIC_APP_URL=<your-vercel-url>

npx vercel
```

Switch Prisma to Postgres by changing `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Socket Server (Railway/Fly.io/Render)**:
```bash
# Deploy just the server/ folder
# Set: PORT=3001, DATABASE_URL=<same postgres>, JWT_SECRET=<same secret>
node server/index.js
```

### Option B: Single Node Server (VPS/Hetzner)

```bash
# Build Next.js
npm run build

# Run everything with PM2
npm install -g pm2
pm2 start "npm run start" --name hexgame-next
pm2 start server/index.js --name hexgame-socket

# Set up Nginx to proxy:
# / → port 3000 (Next.js)
# /socket.io → port 3001 (Socket.IO)
```

Nginx config:
```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location /socket.io/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

---

## 🗄 Database Schema

Key models:
- **Host** — Game hosts with auth
- **Question** — Bilingual questions with category/difficulty
- **Session** — Active/past game rooms
- **UsedQuestion** — Tracks which questions were used in which session
- **QuestionHistory** — Full log of asked questions with timestamps

### Migrations
```bash
# Development
npm run db:push

# Production (with migration history)
npm run db:migrate

# Explore data
npm run db:studio
```

---

## 📝 Seed Data Categories

60 questions across 6 categories:
- 🔬 Science (علوم)
- 📜 History (تاريخ)  
- 🌍 Geography (جغرافيا)
- ⚽ Sports (رياضة)
- 💻 Technology (تقنية)
- 🎨 Culture & Arts (ثقافة وفنون)

---

## 🔧 Extending the Question Bank

### Via Admin UI
Go to `/admin` → Add Question → Fill bilingual fields

### Via JSON Import
```json
[
  {
    "questionEn": "What is 2+2?",
    "questionAr": "ما هو 2+2؟",
    "answerEn": "4",
    "answerAr": "4",
    "category": "science",
    "difficulty": "easy",
    "firstLetter": "F"
  }
]
```

### Via CSV Import
Headers: `questionEn,questionAr,answerEn,answerAr,category,difficulty,firstLetter`

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 7 days
- Room codes are cryptographically random
- Host auth required for all admin operations
- Rate limiting: add `express-rate-limit` to `server/index.js` for production

---

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` and `globals.css`
- **Board sizes**: Edit `buildHexGrid()` in `server/index.js`
- **Timer**: Set per-room in Host settings
- **Categories**: Add to `CATEGORIES` array in host/admin pages
- **Fonts**: Replace Google Fonts link in `layout.tsx`
