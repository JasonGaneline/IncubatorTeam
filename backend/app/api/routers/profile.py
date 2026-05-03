"""
Authenticated profile routes for the signed-in user only.

`GET /profile/me` returns mood aggregates, follower counts, and safe user fields.
`PATCH /profile/me` updates pregnancy week (validated by Pydantic).
`GET /users/{user_id}/profile` returns public profile with follow status if authenticated.
"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, get_db
from app.crud import crud_profile, crud_user
from app.models.user import User
from app.schemas.profile import PregnancyWeekUpdate, UserProfileResponse, PublicUserProfileResponse
from app.schemas.user import UserPublic

router = APIRouter(prefix="/profile", tags=["profile"])

CurrentUser = Annotated[User, Depends(get_current_user)]
OptionalCurrentUser = Annotated[User | None, Depends(get_current_user_optional)]

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


@router.get(
    "/{user_id}",
    response_model=PublicUserProfileResponse,
    summary="Get public profile for any user",
)
def get_public_profile(
    user_id: uuid.UUID,
    current_user: OptionalCurrentUser = None,
    db: Session = Depends(get_db),
) -> PublicUserProfileResponse:
    """Get public profile for a user. Current user's follow status included if authenticated."""
    user = crud_user.get_user_by_id(db, user_id=user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    current_user_id = current_user.id if current_user else None
    return crud_profile.build_public_profile_response(
        db,
        user=user,
        current_user_id=current_user_id,
    )
