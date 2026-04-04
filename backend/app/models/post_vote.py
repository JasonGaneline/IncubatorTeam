"""One row per user per post — `direction` 1 = up, -1 = down. Unique (user_id, post_id) prevents duplicates."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Uuid, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class PostVote(Base):
    __tablename__ = "post_votes"
    __table_args__ = (
        UniqueConstraint("user_id", "post_id", name="uq_post_votes_user_post"),
    )

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
    post_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("posts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    direction: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 or -1

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="post_votes")
    post = relationship("Post", back_populates="votes")
