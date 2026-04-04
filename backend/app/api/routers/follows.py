"""
Follow / unfollow another user by UUID.

Both operations require JWT. Self-follow is rejected. Missing target users return 404.
Deleting a user in `users` cascades through `user_follows`, so edges disappear automatically.
"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_follow, crud_user
from app.models.user import User
from app.schemas.follow import FollowStatusResponse

router = APIRouter(prefix="/users", tags=["follows"])

CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/{user_id}/follow",
    response_model=FollowStatusResponse,
    summary="Follow another user (idempotent)",
)
def follow_user_route(
    current_user: CurrentUser,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> FollowStatusResponse:
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot follow yourself.",
        )
    target = crud_user.get_user_by_id(db, user_id=user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    crud_follow.follow_user(db, follower_id=current_user.id, following_id=user_id)
    return FollowStatusResponse(
        follower_id=current_user.id,
        following_id=user_id,
        is_following=True,
    )


@router.delete(
    "/{user_id}/follow",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unfollow a user (idempotent)",
)
def unfollow_user_route(
    current_user: CurrentUser,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Response:
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot unfollow yourself via this edge.",
        )
    target = crud_user.get_user_by_id(db, user_id=user_id)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    crud_follow.unfollow_user(db, follower_id=current_user.id, following_id=user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
