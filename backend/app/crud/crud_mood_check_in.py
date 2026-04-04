"""CRUD for mood check-ins."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime

from sqlalchemy import Date as SA_Date, cast, select
from sqlalchemy.orm import Session

from app.models.mood_check_in import MoodCheckIn


def get_check_in_for_user_on_utc_date(
    db: Session,
    *,
    user_id: uuid.UUID,
    utc_date: date,
) -> MoodCheckIn | None:
    stmt = select(MoodCheckIn).where(
        MoodCheckIn.user_id == user_id,
        cast(MoodCheckIn.created_at, SA_Date) == utc_date,
    )
    return db.execute(stmt).scalar_one_or_none()


def list_check_ins_for_user(
    db: Session,
    *,
    user_id: uuid.UUID,
    limit: int = 100,
) -> list[MoodCheckIn]:
    stmt = (
        select(MoodCheckIn)
        .where(MoodCheckIn.user_id == user_id)
        .order_by(MoodCheckIn.created_at.desc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())


def create_check_in(
    db: Session,
    *,
    user_id: uuid.UUID,
    mood_evaluation: str,
    reflection_text: str | None,
) -> MoodCheckIn:
    row = MoodCheckIn(
        user_id=user_id,
        mood_evaluation=mood_evaluation,
        reflection_text=reflection_text,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def utc_today() -> date:
    return datetime.now(UTC).date()
