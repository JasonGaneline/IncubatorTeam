"""Add weighted mood composition fields for check-ins.

Revision ID: 20260504_14
Revises: 20260504_13
Create Date: 2026-05-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260504_14"
down_revision: Union[str, None] = "20260504_13"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        sa.text(
            """
            ALTER TABLE mood_check_ins
            ADD COLUMN IF NOT EXISTS mood_mix JSONB;
            """
        )
    )
    op.execute(
        sa.text(
            """
            ALTER TABLE mood_check_ins
            ADD COLUMN IF NOT EXISTS mood_score DOUBLE PRECISION;
            """
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE mood_check_ins DROP COLUMN IF EXISTS mood_score;"))
    op.execute(sa.text("ALTER TABLE mood_check_ins DROP COLUMN IF EXISTS mood_mix;"))
