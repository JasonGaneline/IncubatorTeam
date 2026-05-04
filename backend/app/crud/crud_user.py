"""CRUD helpers for the `users` table."""

import uuid

from sqlalchemy import select, or_, func
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
    display_name: str | None = None,
    pregnancy_week: int | None = None,
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        display_name=display_name,
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


def update_user_profile(
    db: Session,
    *,
    user: User,
    display_name: str | None = None,
    bio: str | None = None,
    age: int | None = None,
    profile_picture: str | None = None,
    pregnancy_week: int | None = None,
    user_role: str | None = None,
) -> User:
    if display_name is not None:
        user.display_name = display_name
    if bio is not None:
        user.bio = bio
    if age is not None:
        user.age = age
    if profile_picture is not None:
        user.profile_picture = profile_picture
    if pregnancy_week is not None:
        user.pregnancy_week = pregnancy_week
    if user_role is not None:
        user.user_role = user_role
        # Switching away from pregnant_woman clears the gestational week so the
        # row never carries stale pregnancy data for a non-pregnant role.
        if user_role != "pregnant_woman" and pregnancy_week is None:
            user.pregnancy_week = None
    db.commit()
    db.refresh(user)
    return user


def search_users(
    db: Session,
    *,
    query: str,
    limit: int = 20,
) -> list[User]:
    """
    Search users by display_name or email (case-insensitive).
    
    Returns up to `limit` results (default 20).
    """
    search_term = f"%{query.strip()}%"
    stmt = (
        select(User)
        .where(
            or_(
                func.lower(User.display_name).like(func.lower(search_term)),
                func.lower(User.email).like(func.lower(search_term)),
            )
        )
        .limit(limit)
    )
    return db.execute(stmt).scalars().all()
