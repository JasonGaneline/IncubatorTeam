"""Mood check-in ORM — one row per submitted daily reflection (enforced in service layer)."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MoodCheckIn(Base):
    __tablename__ = "mood_check_ins"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Matches frontend mood option ids (e.g. calm, grateful).
    mood_evaluation: Mapped[str] = mapped_column(String(64), nullable=False)
    # Optional weighted mood composition, e.g. [{"mood":"calm","percentage":50.0}, ...].
    mood_mix: Mapped[list[dict] | None] = mapped_column(JSON, nullable=True)
    # Weighted numeric score for this check-in (1..6 scale).
    mood_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    reflection_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="mood_check_ins")
