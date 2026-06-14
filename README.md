# Nagare 流

> *Where thoughts find their flow.*

Nagare is a calm, AI-powered productivity app that helps you plan your day without overwhelm. Built around the idea that your tasks should flow with your energy — not fight against it.

---

## ✨ Features

- **NANI** — Your ambient AI companion that understands natural language, rearranges your schedule, and helps you think out loud
- **Flow Schedule** — AI-generated daily schedules based on your energy peaks, focus window, and protected moments
- **Constellation World** — A visual map of your tasks and goals across time
- **Memory Jar** — A gentle space to collect your thoughts, tasks, and intentions
- **Focus Beacon** — A Pomodoro timer that lives quietly in your dashboard
- **Mind Sanctuary** — Settings that feel like preferences, not configuration
- **Offline-first** — Tasks queue locally and sync when you're back online

---

## 🛠 Tech Stack

### Frontend
- [Next.js 14](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Supabase JS](https://supabase.com/docs/reference/javascript)

### Backend
- [FastAPI](https://fastapi.tiangolo.com/)
- [Supabase](https://supabase.com/) (Auth + Database)
- [Gemini](https://www.gemini.com/) (AI)
- [Python 3.11](https://www.python.org/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com/) project
- A Gemini API key

---

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Run the dev server:

```bash
npm run dev
```

---

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
```

Create `.env`:

```env
ENVIRONMENT=development
API_HOST=http://localhost:8000
FRONTEND_ORIGIN=http://localhost:3000
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

```

Run the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---


## 🔐 Auth Flow

1. User signs up / logs in via frontend
2. Backend authenticates with Supabase and returns tokens
3. Frontend sets Supabase session and stores `pulse_access_token` cookie
4. Middleware checks cookie on every protected route
5. Backend verifies JWT on every API call

---

## 🌊 API Overview

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Tasks | `GET/POST /tasks`, `GET/PUT/DELETE /tasks/{id}`, `PATCH /tasks/{id}/complete` |
| Schedule | `GET /schedule`, `POST /schedule/generate`, `POST /schedule/reschedule` |
| NANI (ORDA) | `POST /orda/process` |
| Preferences | `GET/PUT /preferences/me`, `GET/POST/PUT/DELETE /routine-tasks` |
| Health | `GET /health` |

---

## 🎨 Design Philosophy

Nagare is built around calm. Every interaction is intentional — no aggressive notifications, no overwhelming lists. The app adapts to your rhythm, not the other way around.

- **Glass morphism** UI with soft gradients
- **Ambient animations** that breathe with you
- **Dark cosmic** theme for focus, light theme for onboarding
- **Mobile-first** with a fixed sidebar on desktop

---

## 📄 License

© 2026 Nagare
