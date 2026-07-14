"""FastAPI application entrypoint."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.routers import menu, cart, orders, promo, payments, admin, addresses

import os
import cloudinary

# ─── Cloudinary Config ────────────────────────────────────────────────────────
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "n7dwstwv"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "943535673528186"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "xP0rKcWOHjx3ZXE8xYa36Jos-iE"),
    secure=True
)

# ─── Rate Limiter ─────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sitara Pizza & Fried Chicks API",
    description="Backend API for the Sitara fast-food ordering platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ─── CORS ─────────────────────────────────────────────────────────────────────
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(menu.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(promo.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(addresses.router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "ok", "service": "sitara-api"}


@app.get("/", tags=["system"])
async def root():
    return {"message": "Sitara Pizza & Fried Chicks API — v1.0.0"}
