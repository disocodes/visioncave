"""Update user nullable fields

Revision ID: update_user_nullable_fields
Revises: add_site_status_config
Create Date: 2024-01-09 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'update_user_nullable_fields'
down_revision: str = 'add_site_status_config'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First update any existing NULL values with default values
    op.execute("UPDATE users SET username = 'user_' || id::text WHERE username IS NULL")
    op.execute("UPDATE users SET email = 'user_' || id::text || '@example.com' WHERE email IS NULL")
    op.execute("UPDATE users SET hashed_password = 'PLACEHOLDER_HASH' WHERE hashed_password IS NULL")
    
    # Then make the columns non-nullable
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('username',
                            existing_type=sa.String(),
                            nullable=False)
        batch_op.alter_column('email',
                            existing_type=sa.String(),
                            nullable=False)
        batch_op.alter_column('hashed_password',
                            existing_type=sa.String(),
                            nullable=False)


def downgrade() -> None:
    # Revert changes if needed
    with op.batch_alter_table('users') as batch_op:
        batch_op.alter_column('username',
                            existing_type=sa.String(),
                            nullable=True)
        batch_op.alter_column('email',
                            existing_type=sa.String(),
                            nullable=True)
        batch_op.alter_column('hashed_password',
                            existing_type=sa.String(),
                            nullable=True)
