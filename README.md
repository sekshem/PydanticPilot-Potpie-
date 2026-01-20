# PydanticPilot

Production-ready full-stack AI agent built with Next.js (frontend) and FastAPI (backend) using Pydantic-validated structured outputs.

## Architecture
- Frontend: Next.js App Router + TypeScript + Tailwind + shadcn/ui (`/` landing, `/app` workspace, `/history`, `/settings`).
- Backend: FastAPI (`/backend`) exposes `/agent/run` and `/health`, orchestrates model calls (Xiaomi MiMo-V2-Flash via OpenRouter-compatible API) with retries, fallback model, and structured validation.
- Mock mode: `NEXT_PUBLIC_USE_MOCK_AGENT=true` keeps the UI functional without a backend.

## Prerequisites
- Node 18+ / pnpm or npm for frontend.
- Python 3.11+ for backend.
- Xiaomi MiMo-V2-Flash (or OpenRouter-compatible) API key.

## Environment Variables
Copy `env.example` to `.env` for the frontend, and `backend/env.example` to `backend/.env` for the backend, then fill values.

Frontend (`.env`):
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-host.example.com
NEXT_PUBLIC_USE_MOCK_AGENT=false
BACKEND_API_BASE_URL=https://your-backend-host.example.com
```

Backend (`backend/.env`):
```
FRONTEND_ORIGIN=http://localhost:3000
MIMO_API_KEY=your_mimo_api_key
OPENROUTER_API_KEY=optional_fallback_key
MODEL_NAME=mimo-v2-flash
FALLBACK_MODEL_NAME=openrouter/anthropic/claude-3-haiku-20240307
MODEL_API_BASE=https://openrouter.ai/api/v1
REQUEST_TIMEOUT_SECONDS=30
MAX_RETRIES=3
```

## Local Development
### Backend (FastAPI)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Endpoints:
- `POST /agent/run` (see contract below)
- `GET /health`

### Frontend (Next.js)
```bash
pnpm install   # or npm install
pnpm dev       # or npm run dev
```
Make sure `NEXT_PUBLIC_API_BASE_URL` points to your local backend (e.g., `http://localhost:8000`), or set `NEXT_PUBLIC_USE_MOCK_AGENT=true` to use mock responses.

## API Contract
`POST /agent/run`
Request:
```json
{
  "goal": "string",
  "context": "string",
  "outputFormat": "plan | checklist | email | summary_actions",
  "tone": "professional | friendly | strict",
  "constraints": ["string"]
}
```
Success Response:
```json
{
  "runId": "uuid",
  "status": "success",
  "title": "string",
  "summary": "string",
  "sections": [{ "heading": "string", "content": ["string"] }],
  "warnings": ["string"],
  "confidence": 0.0,
  "createdAt": "ISO string"
}
```
Error Response matches the same shape with `status: "error"`, empty sections, and warnings containing the reason.

## Deployment
### Frontend (Vercel)
1. Set env vars in Vercel:
   - `NEXT_PUBLIC_API_BASE_URL=https://your-backend-host`
   - `NEXT_PUBLIC_USE_MOCK_AGENT=false`
   - `BACKEND_API_BASE_URL=https://your-backend-host` (for the Next.js API proxy fallback)
2. Deploy normally (`npm run build` must pass).

### Backend (Render / Railway / Fly.io)
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Env vars: values from `backend/.env` (must include `MIMO_API_KEY` or `OPENROUTER_API_KEY`, `MODEL_NAME`, `FRONTEND_ORIGIN`).
- Ensure port 8000 is exposed. CORS is restricted to `FRONTEND_ORIGIN` if provided, otherwise `*`.

## Notes on Reliability
- Retries: primary model up to `MAX_RETRIES`; fallback model attempted if primary fails.
- Timeout: configurable via `REQUEST_TIMEOUT_SECONDS`.
- Logging: request received, model used, retries, and stack traces on errors.
- Validation: strict request validation; schema validation on model responses.
- Rate limiting: simple in-memory per-IP limiter (window 60s, 120 reqs).

## Testing Checklist
- Frontend: `pnpm lint` (if configured) and `pnpm build`.
- Backend: run `uvicorn app.main:app` and test `POST /agent/run` with a valid payload; confirm structured JSON response.
