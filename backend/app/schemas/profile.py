"""Profile API response and update payloads."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.user import UserPublic


class MoodStatsPublic(BaseModel):
    """Aggregated mental-health check-in metrics for the profile screen."""

    total_check_ins: int = 0
    check_ins_this_week: int = 0
    streak_days: int = 0
    last_check_in_at: datetime | None = None
    last_mood_label: str | None = None
    top_mood_label: str | None = None
    average_mood_score: float | None = Field(
        default=None,
        description="Mean of known mood scores (see MOOD_SCORES); null if no data.",
    )


class UserProfileResponse(BaseModel):
    """Full profile payload for GET /profile/me."""

    user: UserPublic
    mood: MoodStatsPublic
    followers_count: int
    following_count: int


class PublicUserProfileResponse(BaseModel):
    """Public profile payload for GET /profile/{user_id}."""

    user: UserPublic
    mood: MoodStatsPublic
    followers_count: int
    following_count: int
    is_following: bool = Field(
        default=False,
        description="Whether the current user (if authenticated) is following this user.",
    )


class PregnancyWeekUpdate(BaseModel):
    """PATCH body — set or clear gestational week."""

    pregnancy_week: int | None = Field(default=None, ge=0, le=42)
