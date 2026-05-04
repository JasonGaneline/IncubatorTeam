"""Defensive: ensure all profile columns exist on users + role rename.

Adds every profile column with `IF NOT EXISTS` so re-running the migration on
an environment that already migrated piecemeal is safe. Also renames any
remaining `user_role='doctor'` rows to `user_role='verified_professional'` to
align with the spec.

Revision ID: 20260504_10
Revises: 20260504_09
Create Date: 2026-05-04
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260504_10"
down_revision: Union[str, None] = "20260504_09"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(150)"))
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT"))
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER"))
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500)"))
    op.execute(
        sa.text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_doctor BOOLEAN NOT NULL DEFAULT FALSE"
        )
    )
    op.execute(
        sa.text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS user_role VARCHAR(64) NOT NULL DEFAULT 'information_only'"
        )
    )
    op.execute(sa.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS pregnancy_week INTEGER"))

    op.execute(
        sa.text("CREATE INDEX IF NOT EXISTS ix_users_display_name ON users (display_name)")
    )

    # Spec uses 'verified_professional' for the doctor role.
    op.execute(
        sa.text("UPDATE users SET user_role = 'verified_professional' WHERE user_role = 'doctor'")
    )


def downgrade() -> None:
    # Defensive migration; downgrade is intentionally a no-op so we don't drop
    # columns that earlier migrations created.
    pass
