# Pulse Plan Backend

FastAPI service for authentication, task CRUD, AI schedule generation, and ORDA natural-language commands.

## Run

```bash
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Security

- Supabase access tokens are verified on protected routes.
- Service-role access is isolated to the backend repository layer.
- RLS policies in Supabase still enforce ownership for client-side access.
- Rate limiting, CORS allowlists, size limits, secure headers, and centralized exception handling are enabled in `app/main.py`.

