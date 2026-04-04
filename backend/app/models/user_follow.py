"""
Follow graph: `follower_id` follows `following_id`.

Both foreign keys use ON DELETE CASCADE so removing a user automatically removes every edge
where they appear as follower or following — no orphan rows and no broken references.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, PrimaryKeyConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserFollow(Base):
    __tablename__ = "user_follows"
    __table_args__ = (
        PrimaryKeyConstraint("follower_id", "following_id", name="pk_user_follows"),
    )

    follower_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    following_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    follower = relationship(
        "User",
        foreign_keys=[follower_id],
        back_populates="following_edges",
    )
    following = relationship(
        "User",
        foreign_keys=[following_id],
        back_populates="follower_edges",
    )
