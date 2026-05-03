"""Profile aggregations: mood history stats plus follow counts."""

from __future__ import annotations

import uuid
from datetime import UTC, date, datetime, timedelta

from sqlalchemy import Date as SA_Date, cast, func, select
from sqlalchemy.orm import Session

from app.constants.mood_scores import MOOD_SCORES
from app.crud import crud_follow
from app.models.mood_check_in import MoodCheckIn
from app.models.user import User
from app.schemas.profile import MoodStatsPublic, UserProfileResponse, PublicUserProfileResponse
from app.schemas.user import UserPublic


def _utc_today() -> date:
    return datetime.now(UTC).date()


def _monday_start_week(d: date) -> date:
    return d - timedelta(days=d.weekday())


def _streak_from_distinct_dates(dates: set[date]) -> int:
    """Longest run of consecutive UTC days ending at the user's most recent check-in day."""
    if not dates:
        return 0
    anchor = max(dates)
    streak = 0
    cursor = anchor
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def compute_mood_stats(db: Session, *, user_id: uuid.UUID) -> MoodStatsPublic:
    total_q = select(func.count()).select_from(MoodCheckIn).where(MoodCheckIn.user_id == user_id)
    total = int(db.execute(total_q).scalar_one() or 0)

    today = _utc_today()
    week_start = _monday_start_week(today)
    week_q = select(func.count()).select_from(MoodCheckIn).where(
        MoodCheckIn.user_id == user_id,
        cast(MoodCheckIn.created_at, SA_Date) >= week_start,
    )
    this_week = int(db.execute(week_q).scalar_one() or 0)

    dates_q = select(cast(MoodCheckIn.created_at, SA_Date)).where(
        MoodCheckIn.user_id == user_id,
    )
    date_rows = db.execute(dates_q).scalars().all()
    distinct_days = set(date_rows)
    streak = _streak_from_distinct_dates(distinct_days)

    last_row = db.execute(
        select(MoodCheckIn)
        .where(MoodCheckIn.user_id == user_id)
        .order_by(MoodCheckIn.created_at.desc())
        .limit(1),
    ).scalar_one_or_none()

    top_label: str | None = None
    cnt = func.count().label("mood_cnt")
    top_q = (
        select(MoodCheckIn.mood_evaluation, cnt)
        .where(MoodCheckIn.user_id == user_id)
        .group_by(MoodCheckIn.mood_evaluation)
        .order_by(cnt.desc())
        .limit(1)
    )
    top_row = db.execute(top_q).first()
    if top_row:
        top_label = top_row[0]

    avg_score: float | None = None
    moods_q = select(MoodCheckIn.mood_evaluation).where(MoodCheckIn.user_id == user_id)
    moods = list(db.execute(moods_q).scalars().all())
    scores = [MOOD_SCORES[m] for m in moods if m in MOOD_SCORES]
    if scores:
        avg_score = round(sum(scores) / len(scores), 2)

    return MoodStatsPublic(
        total_check_ins=total,
        check_ins_this_week=this_week,
        streak_days=streak,
        last_check_in_at=last_row.created_at if last_row else None,
        last_mood_label=last_row.mood_evaluation if last_row else None,
        top_mood_label=top_label,
        average_mood_score=avg_score,
    )


def build_profile_response(db: Session, *, user: User) -> UserProfileResponse:
    mood = compute_mood_stats(db, user_id=user.id)
    followers = crud_follow.count_followers(db, user_id=user.id)
    following = crud_follow.count_following(db, user_id=user.id)
    return UserProfileResponse(
        user=UserPublic.model_validate(user),
        mood=mood,
        followers_count=followers,
        following_count=following,
    )


def build_public_profile_response(
    db: Session,
    *,
    user: User,
    current_user_id: uuid.UUID | None = None,
) -> PublicUserProfileResponse:
    """Build public profile response with optional follow status for current user."""
    mood = compute_mood_stats(db, user_id=user.id)
    followers = crud_follow.count_followers(db, user_id=user.id)
    following = crud_follow.count_following(db, user_id=user.id)

    is_following = False
    if current_user_id and current_user_id != user.id:
        is_following = crud_follow.is_following(
            db,
            follower_id=current_user_id,
            following_id=user.id,
        )

    return PublicUserProfileResponse(
        user=UserPublic.model_validate(user),
        mood=mood,
        followers_count=followers,
        following_count=following,
        is_following=is_following,
    )
