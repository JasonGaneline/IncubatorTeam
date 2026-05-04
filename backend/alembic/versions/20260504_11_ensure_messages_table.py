"""Ensure messages table exists with spec columns (fixes missing table / failed 09).

If `messages` was never created (e.g. migration 09 failed on ADD COLUMN when the
table did not exist), this revision creates it. If an older table exists with
`recipient_id` / `body`, those columns are renamed and `is_read` is added.

Revision ID: 20260504_11
Revises: 20260504_10
Create Date: 2026-05-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260504_11"
down_revision: Union[str, None] = "20260504_10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'messages'
                ) THEN
                    CREATE TABLE messages (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        content TEXT NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        is_read BOOLEAN NOT NULL DEFAULT FALSE,
                        chat_request_status VARCHAR(16)
                    );
                    CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages (sender_id);
                    CREATE INDEX IF NOT EXISTS ix_messages_receiver_id ON messages (receiver_id);
                ELSE
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'messages' AND column_name = 'recipient_id'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'messages' AND column_name = 'receiver_id'
                    ) THEN
                        EXECUTE 'ALTER TABLE messages RENAME COLUMN recipient_id TO receiver_id';
                    END IF;
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'messages' AND column_name = 'body'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM information_schema.columns
                        WHERE table_name = 'messages' AND column_name = 'content'
                    ) THEN
                        EXECUTE 'ALTER TABLE messages RENAME COLUMN body TO content';
                    END IF;
                    EXECUTE 'ALTER INDEX IF EXISTS ix_messages_recipient_id RENAME TO ix_messages_receiver_id';
                    EXECUTE 'ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE';
                    EXECUTE 'ALTER TABLE messages ADD COLUMN IF NOT EXISTS chat_request_status VARCHAR(16)';
                    CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages (sender_id);
                    CREATE INDEX IF NOT EXISTS ix_messages_receiver_id ON messages (receiver_id);
                END IF;
            END
            $$;
            """
        )
    )


def downgrade() -> None:
    pass
