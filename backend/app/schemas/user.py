"""User-related Pydantic models (public representation, no password fields)."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

UserRole = Literal[
    "pregnant_woman",
    "spouse_of_pregnant_woman",
    "soon_to_be_pregnant",
    "information_only",
]


class UserBase(BaseModel):
    email: EmailStr
    user_role: UserRole = Field(
        description="How this user relates to the pregnancy journey.",
    )
    pregnancy_week: int | None = Field(
        default=None,
        ge=0,
        le=42,
        description="Gestational week, if known (0-42).",
    )


class UserPublic(UserBase):
    """Safe to return to clients after login or from profile endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
