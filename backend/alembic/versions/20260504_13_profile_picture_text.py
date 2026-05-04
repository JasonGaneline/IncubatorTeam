"""Widen users.profile_picture to TEXT for data URLs / long CDN URLs.

Revision ID: 20260504_13
Revises: 20260504_12
Create Date: 2026-05-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260504_13"
down_revision: Union[str, None] = "20260504_12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_schema = 'public'
                      AND table_name = 'users'
                      AND column_name = 'profile_picture'
                ) THEN
                    ALTER TABLE users
                    ALTER COLUMN profile_picture TYPE TEXT
                    USING profile_picture::TEXT;
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
            ALTER TABLE users
            ALTER COLUMN profile_picture TYPE VARCHAR(500)
            USING LEFT(profile_picture, 500);
            """
        )
    )
