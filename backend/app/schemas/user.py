"""User-related Pydantic models (public representation, no password fields)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    pregnancy_week: int | None = Field(
        default=None,
        ge=0,
        le=42,
        description="Gestational week, if known (0–42).",
    )


class UserPublic(UserBase):
    """Safe to return to clients after login or from profile endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
