"""
Delete every row from application tables (schema unchanged).

Uses DATABASE_URL from backend/.env (same as the API / Alembic).
Only truncates tables that actually exist (some DBs may not have every migration).

  Windows (PowerShell):
    cd backend
    $env:CONFIRM_CLEAR_ALL_DATA='YES'
    py -3.13 scripts/clear_app_data.py

  Unix:
    cd backend && CONFIRM_CLEAR_ALL_DATA=YES python3 scripts/clear_app_data.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.core.config import get_settings  # noqa: E402

# Child tables first, then parents (FK-safe order for Postgres TRUNCATE).
_APP_TABLES_ORDERED = (
    "post_votes",
    "replies",
    "follow_requests",
    "posts",
    "messages",
    "mood_check_ins",
    "user_follows",
    "users",
)


def main() -> None:
    if os.environ.get("CONFIRM_CLEAR_ALL_DATA") != "YES":
        print(
            "Refusing to run: set environment variable CONFIRM_CLEAR_ALL_DATA=YES "
            "after you confirm this targets the correct database.",
        )
        sys.exit(1)

    settings = get_settings()
    url = settings.DATABASE_URL
    if not url:
        print("DATABASE_URL is empty.")
        sys.exit(1)

    engine = create_engine(url)
    with engine.begin() as conn:
        rows = conn.execute(
            text(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_type = 'BASE TABLE'
                """
            ),
        ).fetchall()
        present = {r[0] for r in rows}
        to_truncate = [t for t in _APP_TABLES_ORDERED if t in present]
        if not to_truncate:
            print("No matching app tables found in public schema; nothing to do.")
            return
        stmt = (
            "TRUNCATE TABLE\n  "
            + ",\n  ".join(to_truncate)
            + "\nRESTART IDENTITY CASCADE;"
        )
        conn.execute(text(stmt))
    print("Truncated:", ", ".join(to_truncate))


if __name__ == "__main__":
    main()
