"""
Authenticated profile routes for the signed-in user only.

`GET /profile/me` returns mood aggregates, follower counts, and safe user fields.
`PATCH /profile/me` updates pregnancy week (validated by Pydantic).
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_profile, crud_user
from app.models.user import User
from app.schemas.profile import PregnancyWeekUpdate, UserProfileResponse
from app.schemas.user import UserPublic

router = APIRouter(prefix="/profile", tags=["profile"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get("/me", response_model=UserProfileResponse, summary="Current user profile + stats")
def get_my_profile(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    return crud_profile.build_profile_response(db, user=current_user)


@router.patch("/me", response_model=UserPublic, summary="Update pregnancy week")
def patch_my_profile(
    current_user: CurrentUser,
    payload: PregnancyWeekUpdate,
    db: Session = Depends(get_db),
) -> UserPublic:
    updated = crud_user.update_user_pregnancy_week(
        db,
        user=current_user,
        pregnancy_week=payload.pregnancy_week,
    )
    return UserPublic.model_validate(updated)
