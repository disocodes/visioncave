from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Recording, Task
from datetime import datetime, timedelta
import os

class RecordingsService:
    async def create_recording(
        self, db: Session, name: str, file_path: str, user_id: int
    ) -> Recording:
        """Create a new recording entry."""
        try:
            recording = Recording(
                name=name,
                file_path=file_path,
                owner_id=user_id,
                created_at=datetime.utcnow(),
            )
            
            db.add(recording)
            db.commit()
            db.refresh(recording)
            
            return recording
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def get_recordings(
        self, db: Session, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Recording]:
        """Get list of recordings with their applied tasks."""
        return (
            db.query(Recording)
            .filter(Recording.owner_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    async def get_recording(
        self, db: Session, recording_id: int, user_id: int
    ) -> Optional[Recording]:
        """Get a specific recording by ID."""
        return (
            db.query(Recording)
            .filter(Recording.id == recording_id, Recording.owner_id == user_id)
            .first()
        )

    async def delete_recording(
        self, db: Session, recording_id: int, user_id: int
    ) -> bool:
        """Delete a recording and its file."""
        try:
            recording = await self.get_recording(db, recording_id, user_id)
            if not recording:
                raise ValueError("Recording not found")

            # Delete the actual file
            if os.path.exists(recording.file_path):
                os.remove(recording.file_path)

            # Delete from database
            db.delete(recording)
            db.commit()
            
            return True
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def apply_retention_rules(
        self, db: Session, max_age_days: int, max_storage_gb: float
    ):
        """Apply retention rules to recordings."""
        try:
            # Delete recordings older than max_age_days
            cutoff_date = datetime.utcnow() - timedelta(days=max_age_days)
            old_recordings = (
                db.query(Recording)
                .filter(Recording.created_at < cutoff_date)
                .all()
            )

            for recording in old_recordings:
                await self.delete_recording(db, recording.id, recording.owner_id)

            # Check total storage and delete oldest if exceeding max_storage_gb
            total_size_gb = 0
            all_recordings = (
                db.query(Recording)
                .order_by(Recording.created_at.desc())
                .all()
            )

            for recording in all_recordings:
                if os.path.exists(recording.file_path):
                    size_gb = os.path.getsize(recording.file_path) / (1024 * 1024 * 1024)
                    total_size_gb += size_gb

                    if total_size_gb > max_storage_gb:
                        await self.delete_recording(db, recording.id, recording.owner_id)

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def get_recording_tasks(
        self, db: Session, recording_id: int, user_id: int
    ) -> List[Task]:
        """Get tasks applied to a recording."""
        recording = await self.get_recording(db, recording_id, user_id)
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        return recording.applied_tasks
