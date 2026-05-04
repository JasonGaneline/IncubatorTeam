from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    receiver_id: UUID
    content: str = Field(min_length=1, max_length=4000)


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sender_id: UUID
    receiver_id: UUID
    content: str
    created_at: datetime
    is_read: bool = False
    chat_request_status: str | None = None


class ConversationThreadMeta(BaseModel):
    """Follow + chat-request state for GET /messages/{peer_id}."""

    i_follow_peer: bool
    peer_follows_me: bool
    mutual_follow: bool
    peer_is_verified_professional: bool
    outgoing_request_pending: bool
    incoming_request_pending: bool
    outgoing_request_declined: bool
    can_send: bool
    send_disabled_reason: str | None = None


class ConversationDetail(BaseModel):
    messages: list[MessageRead]
    thread: ConversationThreadMeta


class ConversationPeer(BaseModel):
    """Peer user info shown on the conversation list row."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    display_name: str | None = None
    profile_picture: str | None = None
    is_verified_doctor: bool = False
    user_role: str | None = None


class ConversationSummary(BaseModel):
    """One row per conversation partner for GET /messages."""

    peer: ConversationPeer
    last_message: str
    last_created_at: datetime
    unread_count: int = 0
