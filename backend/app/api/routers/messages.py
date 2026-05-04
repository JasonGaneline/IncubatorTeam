"""Direct messaging routes.

Endpoints:
    POST   /messages                              -> send (follow + chat-request rules)
    GET    /messages                              -> list conversation summaries
    GET    /messages/{user_id}                    -> messages + thread meta; marks read
    POST   /messages/{user_id}/chat-request/accept
    POST   /messages/{user_id}/chat-request/decline
"""

from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud import crud_follow, crud_message, crud_user
from app.models.user import User
from app.schemas.message import (
    ConversationDetail,
    ConversationPeer,
    ConversationSummary,
    MessageCreate,
    MessageRead,
)

router = APIRouter(prefix="/messages", tags=["messages"])
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("", response_model=MessageRead, status_code=status.HTTP_201_CREATED)
def send_message(
    current_user: CurrentUser,
    payload: MessageCreate,
    db: Session = Depends(get_db),
) -> MessageRead:
    if payload.receiver_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot message yourself.",
        )

    receiver = crud_user.get_user_by_id(db, user_id=payload.receiver_id)
    if receiver is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient does not exist.",
        )

    ok, reason = crud_message.compute_can_send(db, sender_id=current_user.id, receiver=receiver)
    if not ok:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=reason or "Messaging not allowed.")

    mutual = crud_message.mutual_follow_exists(db, a_id=current_user.id, b_id=receiver.id)
    peer_prof = crud_message.user_is_verified_professional(receiver)
    chat_status: str | None = None
    if not mutual and not peer_prof:
        chat_status = crud_message.CHAT_PENDING

    msg = crud_message.create_message(
        db,
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=payload.content,
        chat_request_status=chat_status,
    )
    return MessageRead.model_validate(msg)


@router.get("", response_model=list[ConversationSummary])
def list_conversations(
    current_user: CurrentUser,
    db: Session = Depends(get_db),
) -> list[ConversationSummary]:
    rows = crud_message.list_conversations(db, user_id=current_user.id)
    return [
        ConversationSummary(
            peer=ConversationPeer.model_validate(row.peer),
            last_message=row.last_message,
            last_created_at=row.last_created_at,
            unread_count=row.unread_count,
        )
        for row in rows
    ]


@router.post("/{user_id}/chat-request/accept", response_model=dict)
def accept_chat_request(
    current_user: CurrentUser,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Current user accepts a pending chat request from `user_id` (the sender). Follows them back."""
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid recipient.")

    sender = crud_user.get_user_by_id(db, user_id=user_id)
    if sender is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if not crud_message.has_pending_request(db, sender_id=user_id, receiver_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There is no pending chat request from this user.",
        )

    crud_follow.follow_user(db, follower_id=current_user.id, following_id=user_id)
    crud_message.clear_pending_for_pair(db, sender_id=user_id, receiver_id=current_user.id)
    return {"status": "accepted"}


@router.post("/{user_id}/chat-request/decline", response_model=dict)
def decline_chat_request(
    current_user: CurrentUser,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Current user declines pending request messages from `user_id`."""
    if user_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid recipient.")

    if not crud_message.has_pending_request(db, sender_id=user_id, receiver_id=current_user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="There is no pending chat request from this user.",
        )

    crud_message.mark_pending_declined(db, sender_id=user_id, receiver_id=current_user.id)
    return {"status": "declined"}


@router.get("/{user_id}", response_model=ConversationDetail)
def get_conversation(
    current_user: CurrentUser,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> ConversationDetail:
    peer = crud_user.get_user_by_id(db, user_id=user_id)
    if peer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    crud_message.clear_pending_if_mutual(db, user_id=current_user.id, peer_id=user_id)

    messages = crud_message.get_conversation(
        db,
        user_id=current_user.id,
        other_user_id=user_id,
    )
    crud_message.mark_conversation_read(
        db,
        reader_id=current_user.id,
        peer_id=user_id,
    )
    thread = crud_message.build_thread_meta(db, current_user_id=current_user.id, peer=peer)
    return ConversationDetail(
        messages=[MessageRead.model_validate(m) for m in messages],
        thread=thread,
    )
