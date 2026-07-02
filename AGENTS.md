# Sitara Pizza & Fried Chicks — Agent Context

## Brand
- **Name:** Sitara Pizza & Fried Chicks
- **Type:** Fast-food ordering website (menu, cart, checkout, order tracking, admin)
- **Location:** Pakistan market (JazzCash/EasyPaisa payment support)

## Tech Stack

### Frontend (`/frontend`)
- React 18 + Vite
- TailwindCSS (custom neon theme — see `tailwind.config.js`)
- Framer Motion (page transitions, micro-interactions, cart drawer)
- GSAP + ScrollTrigger (hero scroll animations, text reveals)
- React Three Fiber / Three.js (3D rotating pizza hero)
- Zustand (cart & global state)
- TanStack Query / React Query (server state, API caching)
- React Router v6
- Axios (HTTP → FastAPI backend)
- Supabase JS client (auth session, realtime order tracking)
- React Hook Form + Zod (checkout/auth form validation)
- Recharts (admin sales charts)

### Backend (`/backend`)
- FastAPI (async) + Pydantic v2
- Supabase Python client (`supabase-py`) — service role key, server-side only
- python-jose (HS256 JWT verification using SUPABASE_JWT_SECRET)
- Uvicorn + Gunicorn (ASGI)
- slowapi (rate limiting)
- Payments: COD + JazzCash/EasyPaisa stub

### Database
- Supabase (Postgres + Auth + Storage + Realtime)
- Row Level Security (RLS) on all tables
- Supabase Auth: email/password (Google OAuth ready)
- Supabase Storage: menu item images, banners
- Supabase Realtime: order status live updates

## Design Language — "Futuristic Neon"
- **Background:** `#0A0A12` base → `#12121C` surfaces
- **Primary neon:** `#FF4D2E` (electric orange-red — fire/spice brand)
- **Secondary neon:** `#7B2FFF` (violet accent)
- **Accent:** `#00E5FF` (cyan — status indicators)
- **Glassmorphism:** `rgba(255,255,255,0.05)` fill + `backdrop-filter: blur(16px)` + `rgba(255,255,255,0.10)` border
- **Glow shadows:** `0 0 24px rgba(255,77,46,0.45)` (primary), `0 0 24px rgba(123,47,255,0.40)` (secondary)
- **Typography:** Space Grotesk (headings) + Inter (body) — both from Google Fonts
- **Motion:** Framer Motion for UI, GSAP ScrollTrigger for scroll-based hero

## Auth Pattern
1. Frontend logs in via Supabase Auth → gets JWT
2. Frontend sends `Authorization: Bearer <token>` to FastAPI
3. FastAPI `deps.get_current_user` verifies JWT using `SUPABASE_JWT_SECRET`
4. Admin-only routes check `profiles.role == 'admin'`

## Pricing Rule
**Server-side ONLY.** The `POST /api/cart/price` endpoint recalculates totals; client-provided prices are never trusted.

## Folder Conventions
- All backend code: `/backend/app/`
- All frontend code: `/frontend/src/`
- Never commit `.env` files (only `.env.example`)
- Service role key: backend only, never in frontend
- Anon key: frontend only
