"""Authentication request/response schemas — input validation for signup & login."""

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.schemas.user import UserPublic


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    pregnancy_week: int | None = Field(default=None, ge=0, le=42)

    @field_validator("password")
    @classmethod
    def password_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenWithUser(BaseModel):
    """Convenience payload for SPA clients: token plus a safe user projection."""

    access_token: str
    token_type: str = "bearer"
    user: UserPublic
