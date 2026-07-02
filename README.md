# Sitara Pizza & Fried Chicks

> A futuristic fast-food ordering website for Pakistan's hottest pizza & fried chicken brand.

## Stack
- **Frontend:** React 18 + Vite + TailwindCSS + Framer Motion + GSAP + React Three Fiber
- **Backend:** FastAPI (Python) + asyncpg + SQLAlchemy async
- **Database:** Neon Serverless Postgres (Main DB)
- **Auth/Realtime:** Supabase (Postgres + Auth + Realtime + Storage) (Optional)
- **Payments:** COD + JazzCash/EasyPaisa

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- Supabase project (see schema in `AGENTS.md`)

### Frontend
```bash
cd frontend
cp .env.example .env      # fill in your Supabase keys
npm install
npm run dev               # http://localhost:5173
```

### Backend
```bash
cd backend
cp .env.example .env      # fill in your Supabase + payment keys
python -m venv venv
venv\Scripts\activate     # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_API_URL` | FastAPI backend URL (e.g. `http://localhost:8000`) |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | Your Neon Postgres connection string |
| `SUPABASE_URL` | (Optional) Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | (Optional) Supabase service role key (server-side only!) |
| `SUPABASE_JWT_SECRET` | (Optional) Supabase JWT secret (from project settings) |
| `JAZZCASH_MERCHANT_ID` | JazzCash merchant ID |
| `JAZZCASH_PASSWORD` | JazzCash merchant password |
| `JAZZCASH_INTEGRITY_SALT` | JazzCash integrity salt |
| `EASYPAISA_STORE_ID` | EasyPaisa store ID |
| `EASYPAISA_HASH_KEY` | EasyPaisa hash key |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |

## Deployment
- **Frontend:** Vercel (connect GitHub repo, set env vars in dashboard)
- **Backend:** Railway / Render (use `Dockerfile` in `/backend`)
- **Database:** Neon (Primary DB) + Supabase Cloud (Auth/Realtime)

## Project Structure
```
sitara/
├── AGENTS.md          # AI agent context (brand, stack, conventions)
├── README.md          # This file
├── .gitignore
├── frontend/          # React + Vite app
└── backend/           # FastAPI app
```
