"""Pydantic models for mood check-in API."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.constants.moods import ALLOWED_MOOD_KEYS


class MoodMixPortion(BaseModel):
    mood: str = Field(min_length=1, max_length=64)
    # New model: discrete strength slider in [0, 2] stepping by 0.125.
    intensity: float | None = Field(default=None, ge=0, le=2)
    # Backward compatibility for older percentage-based payloads.
    percentage: float | None = Field(default=None, ge=0, le=100)

    @field_validator("mood")
    @classmethod
    def mood_must_be_allowed(cls, v: str) -> str:
        key = v.strip().lower()
        if key not in ALLOWED_MOOD_KEYS:
            raise ValueError(f"Mood must be one of: {', '.join(sorted(ALLOWED_MOOD_KEYS))}")
        return key


class MoodCheckInCreate(BaseModel):
    # New preferred format.
    moods: list[MoodMixPortion] | None = Field(default=None, min_length=1, max_length=6)
    # Backward compatibility for older frontend payloads.
    mood_evaluation: str | None = Field(default=None, min_length=1, max_length=64)
    reflection_text: str | None = Field(default=None, max_length=10_000)

    @field_validator("reflection_text", mode="before")
    @classmethod
    def empty_reflection_to_none(cls, v: str | None) -> str | None:
        if v is None or (isinstance(v, str) and not v.strip()):
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("mood_evaluation")
    @classmethod
    def single_mood_must_be_allowed(cls, v: str | None) -> str | None:
        if v is None:
            return None
        key = v.strip().lower()
        if key not in ALLOWED_MOOD_KEYS:
            raise ValueError(f"Mood must be one of: {', '.join(sorted(ALLOWED_MOOD_KEYS))}")
        return key

    @model_validator(mode="after")
    def validate_mix_or_single(self) -> "MoodCheckInCreate":
        if not self.moods and not self.mood_evaluation:
            raise ValueError("Provide at least one mood via `moods` or `mood_evaluation`.")
        if self.moods:
            mood_ids = [portion.mood for portion in self.moods]
            if len(set(mood_ids)) != len(mood_ids):
                raise ValueError("Duplicate moods are not allowed.")
            has_intensity = any(portion.intensity is not None for portion in self.moods)
            has_percentage = any(portion.percentage is not None for portion in self.moods)
            if has_intensity and has_percentage:
                raise ValueError("Use either intensity or percentage values, not both.")
            if has_percentage:
                total = sum(float(portion.percentage or 0) for portion in self.moods)
                if abs(total - 100.0) > 0.5:
                    raise ValueError("Mood percentages must add up to 100.")
            if has_intensity:
                for portion in self.moods:
                    if portion.intensity is None:
                        raise ValueError("Each selected mood must include an intensity.")
                    scaled = float(portion.intensity) * 8.0
                    if abs(scaled - round(scaled)) > 1e-6:
                        raise ValueError("Intensity must use 0.125 increments.")
        return self


class MoodCheckInRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    mood_evaluation: str
    mood_mix: list[MoodMixPortion] | None = None
    mood_score: float | None = None
    reflection_text: str | None
    created_at: datetime
