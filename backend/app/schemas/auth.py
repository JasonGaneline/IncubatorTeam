"""Authentication request/response schemas - input validation for signup & login."""

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.schemas.user import UserPublic, UserRole


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(
        default=None,
        max_length=150,
        description="Optional display name (e.g., 'Jane Doe').",
    )
    user_role: UserRole
    pregnancy_week: int | None = Field(default=None, ge=0, le=42)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v

    @model_validator(mode="after")
    def validate_role_specific_fields(self) -> "UserSignup":
        if self.user_role == "pregnant_woman" and self.pregnancy_week is None:
            raise ValueError("Pregnancy week is required for pregnant women.")

        if self.user_role != "pregnant_woman":
            self.pregnancy_week = None

        return self


class DoctorSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str | None = Field(
        default=None,
        max_length=150,
        description="Optional display name (e.g., 'Dr. Jane Doe').",
    )
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    npi_number: str = Field(min_length=10, max_length=10, description="10-digit NPI number")

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class DoctorVerifyRequest(BaseModel):
    """In-app NPI verification for an already-authenticated user (e.g. via Google).

    Used by the onboarding "Join as a Professional" path: the user is logged in,
    and we verify their NPI to flip them to a verified_professional role.
    """

    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    npi_number: str = Field(min_length=10, max_length=10, description="10-digit NPI number")


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleAuthRequest(BaseModel):
    credential: str = Field(
        min_length=1,
        description="JWT credential returned by Google's popup button.",
    )


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenWithRefresh(BaseModel):
    """Token response with refresh token for token rotation."""

    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    expires_in: int = 3600  # seconds (1 hour for access token)


class TokenWithUser(BaseModel):
    """Convenience payload for SPA clients: token plus a safe user projection."""

    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserPublic
    expires_in: int = 3600


class RefreshTokenRequest(BaseModel):
    """Request to refresh an expired access token."""

    refresh_token: str = Field(
        min_length=1,
        description="Valid refresh token issued during login/signup.",
    )
