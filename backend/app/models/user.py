"""User ORM model - mirrors the core account fields from the product spec."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    profile_picture: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_role: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        default="information_only",
    )
    is_verified_doctor: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Nullable until onboarding collects it; validate ranges in Pydantic when updating.
    pregnancy_week: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    mood_check_ins = relationship("MoodCheckIn", back_populates="user")
    posts = relationship("Post", back_populates="author")
    replies = relationship("Reply", back_populates="author")
    post_votes = relationship("PostVote", back_populates="user")

    # Outgoing follow rows (I follow someone) and incoming (someone follows me).
    following_edges = relationship(
        "UserFollow",
        foreign_keys="UserFollow.follower_id",
        back_populates="follower",
        passive_deletes=True,
    )
    follower_edges = relationship(
        "UserFollow",
        foreign_keys="UserFollow.following_id",
        back_populates="following",
        passive_deletes=True,
    )
