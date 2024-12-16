"""Initial migration

Revision ID: 97f89c873c23
Revises: 
Create Date: 2024-12-13 15:55:32.914378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '97f89c873c23'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('cameras',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('url', sa.String(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('config', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cameras_id'), 'cameras', ['id'], unique=False)
    op.create_index(op.f('ix_cameras_name'), 'cameras', ['name'], unique=False)
    op.create_table('sites',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('location', sa.String(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_sites_id'), 'sites', ['id'], unique=False)
    op.create_index(op.f('ix_sites_name'), 'sites', ['name'], unique=False)
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=True),
    sa.Column('email', sa.String(), nullable=True),
    sa.Column('hashed_password', sa.String(), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_table('recordings',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('file_path', sa.String(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=True),
    sa.Column('camera_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('retention_period', sa.Integer(), nullable=True),
    sa.Column('storage_provider', sa.String(), nullable=True),
    sa.ForeignKeyConstraint(['camera_id'], ['cameras.id'], ),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recordings_id'), 'recordings', ['id'], unique=False)
    op.create_index(op.f('ix_recordings_name'), 'recordings', ['name'], unique=False)
    op.create_table('widgets',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('type', sa.String(), nullable=True),
    sa.Column('config', sa.JSON(), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('position', sa.JSON(), nullable=True),
    sa.Column('order', sa.Float(), nullable=True),
    sa.Column('module', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('site_id', sa.Integer(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('last_data_update', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.ForeignKeyConstraint(['site_id'], ['sites.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_widgets_id'), 'widgets', ['id'], unique=False)
    op.create_index(op.f('ix_widgets_name'), 'widgets', ['name'], unique=False)
    op.create_table('tasks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=True),
    sa.Column('recording_id', sa.Integer(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('results', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('completed_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['recording_id'], ['recordings.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_id'), 'tasks', ['id'], unique=False)
    op.create_index(op.f('ix_tasks_name'), 'tasks', ['name'], unique=False)
    op.create_table('widget_alerts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('widget_id', sa.Integer(), nullable=True),
    sa.Column('message', sa.String(), nullable=True),
    sa.Column('severity', sa.String(), nullable=True),
    sa.Column('status', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('resolved_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['widget_id'], ['widgets.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_widget_alerts_id'), 'widget_alerts', ['id'], unique=False)
    op.create_table('widget_metrics',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('widget_id', sa.Integer(), nullable=True),
    sa.Column('label', sa.String(), nullable=True),
    sa.Column('value', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['widget_id'], ['widgets.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_widget_metrics_id'), 'widget_metrics', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_widget_metrics_id'), table_name='widget_metrics')
    op.drop_table('widget_metrics')
    op.drop_index(op.f('ix_widget_alerts_id'), table_name='widget_alerts')
    op.drop_table('widget_alerts')
    op.drop_index(op.f('ix_tasks_name'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_id'), table_name='tasks')
    op.drop_table('tasks')
    op.drop_index(op.f('ix_widgets_name'), table_name='widgets')
    op.drop_index(op.f('ix_widgets_id'), table_name='widgets')
    op.drop_table('widgets')
    op.drop_index(op.f('ix_recordings_name'), table_name='recordings')
    op.drop_index(op.f('ix_recordings_id'), table_name='recordings')
    op.drop_table('recordings')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_sites_name'), table_name='sites')
    op.drop_index(op.f('ix_sites_id'), table_name='sites')
    op.drop_table('sites')
    op.drop_index(op.f('ix_cameras_name'), table_name='cameras')
    op.drop_index(op.f('ix_cameras_id'), table_name='cameras')
    op.drop_table('cameras')
    # ### end Alembic commands ###
