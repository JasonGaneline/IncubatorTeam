"""CRUD helpers for the `users` table."""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, *, user_id: uuid.UUID) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, *, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def create_user(
    db: Session,
    *,
    email: str,
    hashed_password: str,
    user_role: str,
    pregnancy_week: int | None,
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        user_role=user_role,
        pregnancy_week=pregnancy_week,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_pregnancy_week(
    db: Session,
    *,
    user: User,
    pregnancy_week: int | None,
) -> User:
    user.pregnancy_week = pregnancy_week
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
