"""
SQLAlchemy engine and session management.

Session pattern (FastAPI):
- `SessionLocal` is a factory for database sessions (one per request is typical).
- `get_db` is a dependency that `yield`s a session, then closes it in `finally`.

This keeps route handlers free of boilerplate and guarantees connections return to the pool.
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.core.config import get_settings

settings = get_settings()

# `pool_pre_ping` checks stale connections before use — helpful with PostgreSQL behind PgBouncer or idle timeouts.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
)

# `autocommit=False`, `autoflush=False` are SQLAlchemy defaults we keep explicit for clarity.
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


class Base(DeclarativeBase):
    """All ORM models inherit from this single declarative base (Alembic imports its `.metadata`)."""


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency: opens a session for the request, yields it to the route, then closes.

    Usage in a router:
        def my_route(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
