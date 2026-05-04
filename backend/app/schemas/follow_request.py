from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class FollowRequestCreate(BaseModel):
    post_id: UUID
    request_type: str


class FollowRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    requester_id: UUID
    post_id: UUID
    request_type: str
    status: str
    created_at: datetime