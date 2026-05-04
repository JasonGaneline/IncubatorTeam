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
    "verified_professional",
]


class UserBase(BaseModel):
    email: EmailStr
    display_name: str | None = Field(
        default=None,
        max_length=150,
        description="User's display name (e.g., 'Jane Doe').",
    )
    bio: str | None = Field(
        default=None,
        max_length=500,
        description="User's bio.",
    )
    age: int | None = Field(
        default=None,
        ge=0,
        le=150,
        description="User's age.",
    )
    profile_picture: str | None = Field(
        default=None,
        max_length=400_000,
        description="Profile image as a URL or a data URL (base64) from an upload.",
    )
    user_role: UserRole = Field(
        description="How this user relates to the pregnancy journey.",
    )
    is_verified_doctor: bool = Field(
        default=False,
        description="True when the user has been verified through the NPPES NPI registry.",
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


class UserSearchResult(UserPublic):
    """User result from search endpoint."""

    model_config = ConfigDict(from_attributes=True)
