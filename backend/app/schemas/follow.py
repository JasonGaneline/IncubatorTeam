"""Follow / unfollow response shapes."""

from uuid import UUID

from pydantic import BaseModel


class FollowStatusResponse(BaseModel):
    follower_id: UUID
    following_id: UUID
    is_following: bool
