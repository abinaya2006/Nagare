# Pulse Plan

Pulse Plan is an AI-powered productivity assistant for adaptive scheduling.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind, shadcn-style components, Lucide, Axios, next-pwa, Context API, localForage, date-fns
- Backend: FastAPI, Pydantic, Supabase Python SDK, httpx, JWT validation, structured logging
- Database: Supabase Postgres with RLS
- AI: Provider-agnostic interface with DeepSeek implemented

## Local Development

1. Copy environment files:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

2. Create a Supabase project and run `supabase/migrations/001_initial_schema.sql`.
3. Add Supabase and gemini credentials to the env files.
4. Start the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

5. Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

- Frontend: deploy `frontend/` to Vercel and set `NEXT_PUBLIC_*` variables.
- Backend: deploy `backend/` to Render using the included Dockerfile.
- Database: use Supabase Cloud and run the SQL migration.

## Security Notes

Pulse Plan uses Supabase Auth, backend JWT verification, RLS ownership policies, rate limiting, request-size guards, CORS allowlists, structured audit logging, and Pydantic validation. No secrets are committed; use env files or provider-managed secret stores.

