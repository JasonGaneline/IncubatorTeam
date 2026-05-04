"""
FastAPI application entrypoint.

- Registers API routers under a versioned prefix (`/api/v1`).
- Enables CORS for the Vite dev server (origins from settings).
- Keeps orchestration here; business rules live in CRUD/security modules.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers import (
    auth,
    check_ins,
    community,
    follows,
    messages,
    profile,
    requests,
)
from app.core.config import get_settings


settings = get_settings()

app = FastAPI(
    title="Nest & Nurture API",
    description="REST API for pregnancy support (auth, check-ins, community, messaging).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Versioned surface area — add new routers alongside `auth` as features grow.
app.include_router(auth.router, prefix="/api/v1")
app.include_router(check_ins.router, prefix="/api/v1")
app.include_router(community.router, prefix="/api/v1")
app.include_router(profile.router, prefix="/api/v1")
app.include_router(profile.users_router, prefix="/api/v1")
app.include_router(follows.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")
app.include_router(requests.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    """Cheap liveness probe for containers and load balancers."""
    return {"status": "ok"}
