"""Task functions shared between services"""
from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..models.sql_models import Recording, Task

async def create_processing_task(
    db: Session,
    recording_id: int,
    model_id: str,
    name: str
) -> Task:
    """Create a new processing task"""
    task = Task(
        name=name,
        status="queued",
        recording_id=recording_id,
        model_id=model_id,
        created_at=datetime.utcnow()
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

async def update_task_status(
    db: Session,
    task: Task,
    celery_task_id: str
) -> Task:
    """Update task with Celery task ID"""
    task.celery_task_id = celery_task_id
    db.commit()
    db.refresh(task)
    return task

async def update_recording_status(
    db: Session,
    recording_id: int,
    status: str
) -> Optional[Recording]:
    """Update recording processing status"""
    recording = (
        db.query(Recording)
        .filter(Recording.id == recording_id)
        .first()
    )
    if recording:
        recording.processing_status = status
        db.commit()
        db.refresh(recording)
    return recording

async def update_recording_results(
    db: Session,
    recording_id: int,
    results: Dict[str, Any]
) -> Optional[Recording]:
    """Update recording with processing results"""
    recording = (
        db.query(Recording)
        .filter(Recording.id == recording_id)
        .first()
    )
    if recording:
        recording.processing_results = results
        db.commit()
        db.refresh(recording)
    return recording
