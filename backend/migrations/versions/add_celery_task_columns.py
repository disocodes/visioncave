"""add celery task columns

Revision ID: add_celery_task_columns
Revises: update_user_nullable_fields
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_celery_task_columns'
down_revision = 'update_user_nullable_fields'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to recordings table
    op.add_column('recordings', sa.Column('processing_status', sa.String(), nullable=True, server_default='pending'))
    op.add_column('recordings', sa.Column('processing_results', postgresql.JSON(astext_type=sa.Text()), nullable=True))

    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('model_id', sa.String(), nullable=True))  # Making nullable for existing records
    op.add_column('tasks', sa.Column('celery_task_id', sa.String(), nullable=True))
    op.add_column('tasks', sa.Column('error', sa.String(), nullable=True))

    # Update existing task records to have a default model_id
    op.execute("UPDATE tasks SET model_id = 'default' WHERE model_id IS NULL")
    
    # Make model_id non-nullable after setting default value
    op.alter_column('tasks', 'model_id',
                    existing_type=sa.String(),
                    nullable=False)

def downgrade():
    # Remove columns from recordings table
    op.drop_column('recordings', 'processing_status')
    op.drop_column('recordings', 'processing_results')

    # Remove columns from tasks table
    op.drop_column('tasks', 'model_id')
    op.drop_column('tasks', 'celery_task_id')
    op.drop_column('tasks', 'error')
