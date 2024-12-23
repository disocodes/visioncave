"""add site status and config

Revision ID: add_site_status_config
Revises: 97f89c873c23
Create Date: 2024-01-20 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_site_status_config'
down_revision = '97f89c873c23'
branch_labels = None
depends_on = None

def upgrade():
    # Add status column with default value 'active'
    op.add_column('sites', sa.Column('status', sa.String(), nullable=True))
    op.execute("UPDATE sites SET status = 'active' WHERE status IS NULL")
    op.alter_column('sites', 'status', nullable=False, server_default='active')

    # Add configuration column with default empty widget list
    op.add_column('sites', sa.Column('configuration', sa.JSON(), nullable=True))
    op.execute("""UPDATE sites SET configuration = '{"widgets":[]}' WHERE configuration IS NULL""")
    op.alter_column('sites', 'configuration', nullable=False, server_default=sa.text("'{\"widgets\":[]}'::jsonb"))

    # Add updated_at column
    op.add_column('sites', sa.Column('updated_at', sa.DateTime(), nullable=True))

def downgrade():
    op.drop_column('sites', 'updated_at')
    op.drop_column('sites', 'configuration')
    op.drop_column('sites', 'status')
