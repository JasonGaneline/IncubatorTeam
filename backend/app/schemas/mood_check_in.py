"""Pydantic models for mood check-in API."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants.moods import ALLOWED_MOOD_KEYS


class MoodCheckInCreate(BaseModel):
    mood_evaluation: str = Field(min_length=1, max_length=64)
    reflection_text: str | None = Field(default=None, max_length=10_000)

    @field_validator("reflection_text", mode="before")
    @classmethod
    def empty_reflection_to_none(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("mood_evaluation")
    @classmethod
    def mood_must_be_allowed(cls, v: str) -> str:
        key = v.strip().lower()
        if key not in ALLOWED_MOOD_KEYS:
            raise ValueError(f"Mood must be one of: {', '.join(sorted(ALLOWED_MOOD_KEYS))}")
        return key


class MoodCheckInRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    mood_evaluation: str
    reflection_text: str | None
    created_at: datetime
