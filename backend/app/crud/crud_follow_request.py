import uuid
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.follow_request import FollowRequest


def create_request(db: Session, *, requester_id: uuid.UUID, post_id: uuid.UUID, request_type: str) -> FollowRequest:
    req = FollowRequest(requester_id=requester_id, post_id=post_id, request_type=request_type)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def get_pending_requests(db: Session, *, user_id: uuid.UUID, post_id: uuid.UUID) -> list[FollowRequest]:
    stmt = select(FollowRequest).where(
        FollowRequest.post_id == post_id,
        FollowRequest.status == "pending"
    )
    return db.execute(stmt).scalars().all()


def update_request_status(db: Session, *, request_id: uuid.UUID, status: str) -> FollowRequest:
    req = db.get(FollowRequest, request_id)
    if req:
        req.status = status
        db.commit()
        db.refresh(req)
    return req