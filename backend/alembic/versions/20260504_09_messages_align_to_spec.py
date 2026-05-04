"""Align messages table with spec: receiver_id, content, is_read.

Renames `recipient_id` -> `receiver_id`, `body` -> `content`, and adds the
`is_read` column. Uses raw SQL with IF EXISTS / IF NOT EXISTS guards so the
migration is safe to re-apply on partially-migrated databases.

Revision ID: 20260504_09
Revises: 20260504_08
Create Date: 2026-05-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260504_09"
down_revision: Union[str, None] = "20260504_08"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Column renames are safe to repeat by guarding with information_schema.
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'recipient_id'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'receiver_id'
                ) THEN
                    EXECUTE 'ALTER TABLE messages RENAME COLUMN recipient_id TO receiver_id';
                END IF;
            END
            $$;
            """
        )
    )

    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'body'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'content'
                ) THEN
                    EXECUTE 'ALTER TABLE messages RENAME COLUMN body TO content';
                END IF;
            END
            $$;
            """
        )
    )

    op.execute(sa.text("ALTER INDEX IF EXISTS ix_messages_recipient_id RENAME TO ix_messages_receiver_id"))

    op.execute(
        sa.text(
            "ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE"
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE messages DROP COLUMN IF EXISTS is_read"))
    op.execute(sa.text("ALTER INDEX IF EXISTS ix_messages_receiver_id RENAME TO ix_messages_recipient_id"))
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'content'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'body'
                ) THEN
                    EXECUTE 'ALTER TABLE messages RENAME COLUMN content TO body';
                END IF;
            END
            $$;
            """
        )
    )
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'receiver_id'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'messages' AND column_name = 'recipient_id'
                ) THEN
                    EXECUTE 'ALTER TABLE messages RENAME COLUMN receiver_id TO recipient_id';
                END IF;
            END
            $$;
            """
        )
    )
