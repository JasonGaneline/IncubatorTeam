"""Follow graph CRUD — edges live in `user_follows` with composite PK."""

from __future__ import annotations

import uuid

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models.user_follow import UserFollow


def get_follow_edge(
    db: Session,
    *,
    follower_id: uuid.UUID,
    following_id: uuid.UUID,
) -> UserFollow | None:
    stmt = select(UserFollow).where(
        UserFollow.follower_id == follower_id,
        UserFollow.following_id == following_id,
    )
    return db.execute(stmt).scalar_one_or_none()


def follow_user(
    db: Session,
    *,
    follower_id: uuid.UUID,
    following_id: uuid.UUID,
) -> tuple[UserFollow, bool]:
    """
    Ensure an edge exists. Returns (row, created) where created is True if inserted.
    """
    existing = get_follow_edge(db, follower_id=follower_id, following_id=following_id)
    if existing:
        return existing, False
    row = UserFollow(follower_id=follower_id, following_id=following_id)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row, True


def unfollow_user(
    db: Session, *, follower_id: uuid.UUID, following_id: uuid.UUID) -> bool:
    """Return True if a row was deleted."""
    stmt = delete(UserFollow).where(
        UserFollow.follower_id == follower_id,
        UserFollow.following_id == following_id,
    )
    res = db.execute(stmt)
    db.commit()
    return res.rowcount > 0


def count_followers(db: Session, *, user_id: uuid.UUID) -> int:
    q = select(func.count()).select_from(UserFollow).where(UserFollow.following_id == user_id)
    return int(db.execute(q).scalar_one() or 0)


def count_following(db: Session, *, user_id: uuid.UUID) -> int:
    q = select(func.count()).select_from(UserFollow).where(UserFollow.follower_id == user_id)
    return int(db.execute(q).scalar_one() or 0)
