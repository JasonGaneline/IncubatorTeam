"""Profile API response and update payloads."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.schemas.user import UserPublic, UserRole


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


class ProfileUpdate(BaseModel):
    """PATCH/PUT body for updating profile fields."""

    display_name: str | None = Field(default=None, max_length=150)
    bio: str | None = Field(default=None, max_length=500)
    age: int | None = Field(default=None, ge=0, le=150)
    profile_picture: str | None = Field(default=None, max_length=400_000)
    pregnancy_week: int | None = Field(default=None, ge=0, le=42)
    user_role: UserRole | None = Field(
        default=None,
        description="If provided, updates the user's role (e.g. set after onboarding).",
    )

    @model_validator(mode="after")
    def validate_pregnant_woman_requires_week(self) -> "ProfileUpdate":
        """If the role is being set to 'pregnant_woman', pregnancy_week must come along."""
        if self.user_role == "pregnant_woman" and self.pregnancy_week is None:
            raise ValueError(
                "pregnancy_week is required when user_role is 'pregnant_woman'."
            )
        return self
