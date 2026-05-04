"""Add messages.chat_request_status for pending/declined chat requests.

Revision ID: 20260504_12
Revises: 20260504_11
Create Date: 2026-05-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260504_12"
down_revision: Union[str, None] = "20260504_11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Idempotent for any Postgres version / pooler: avoid relying on ADD COLUMN IF NOT EXISTS alone.
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'messages'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'messages'
                      AND column_name = 'chat_request_status'
                ) THEN
                    ALTER TABLE messages ADD COLUMN chat_request_status VARCHAR(16);
                END IF;
            END
            $$;
            """
        )
    )


def downgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'messages'
                      AND column_name = 'chat_request_status'
                ) THEN
                    ALTER TABLE messages DROP COLUMN chat_request_status;
                END IF;
            END
            $$;
            """
        )
    )
