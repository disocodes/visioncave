from typing import Dict, Any, List, Optional, Union
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Recording, Task
from ..schemas.recording import StorageConfig, VLMConfig, ModelConfig, ModelType
from datetime import datetime, timedelta
from ..tasks.model_processing import process_recording, batch_process_recordings, check_processing_status
from celery.result import AsyncResult
import os
import json

class RecordingsService:
    def __init__(self):
        self.available_models = [
            ModelConfig(
                id="yolov5",
                name="YOLOv5",
                type=ModelType.YOLO,
                description="General object detection model",
                version="6.0",
                parameters={"size": "medium"}
            ),
            ModelConfig(
                id="opencv-motion",
                name="OpenCV Motion Detection",
                type=ModelType.OPENCV,
                description="Basic motion detection",
                parameters={"sensitivity": 0.5}
            ),
            ModelConfig(
                id="vlm-base",
                name="VLM Base Model",
                type=ModelType.VLM,
                description="Vision Language Model for general analysis",
                parameters={"max_tokens": 1000}
            )
        ]
        self.storage_config = None
        self.vlm_config = None
    async def get_available_models(self, db: Session) -> List[ModelConfig]:
        """Get list of available CV and VLM models."""
        return self.available_models

    async def configure_storage(self, db: Session, config: StorageConfig):
        """Configure storage provider settings."""
        try:
            # Save configuration to database or file
            config_path = os.path.join(os.path.dirname(__file__), '../config/storage.json')
            with open(config_path, 'w') as f:
                json.dump(config.dict(), f)
            self.storage_config = config
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to configure storage: {str(e)}")

    async def configure_vlm(self, db: Session, config: VLMConfig):
        """Configure VLM settings."""
        try:
            # Save configuration to database or file
            config_path = os.path.join(os.path.dirname(__file__), '../config/vlm.json')
            with open(config_path, 'w') as f:
                json.dump(config.dict(), f)
            self.vlm_config = config
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to configure VLM: {str(e)}")

    async def apply_models(self, db: Session, recording_id: int, model_ids: List[str]):
        """Apply selected models to a recording."""
        recording = await self.get_recording(db, recording_id, None)  # TODO: Add user_id check
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")

        try:
            for model_id in model_ids:
                # Find model configuration
                model = next((m for m in self.available_models if m.id == model_id), None)
                if not model:
                    raise ValueError(f"Model {model_id} not found")

                # Create task entry in database
                task = Task(
                    name=f"Apply {model.name}",
                    status="queued",
                    recording_id=recording_id,
                    model_id=model_id,
                    created_at=datetime.utcnow()
                )
                db.add(task)
                db.commit()
                db.refresh(task)

                # Queue Celery task
                celery_task = process_recording.delay(recording_id, model_id)
                
                # Update task with Celery task ID
                task.celery_task_id = celery_task.id
                db.commit()

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Failed to apply models: {str(e)}")

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
        
        # Update task statuses from Celery
        tasks = recording.applied_tasks
        for task in tasks:
            if task.celery_task_id:
                celery_result = AsyncResult(task.celery_task_id)
                task.status = celery_result.status
                if celery_result.ready():
                    if celery_result.successful():
                        task.result = celery_result.get()
                    else:
                        task.error = str(celery_result.result)
        db.commit()
        
        return tasks

    async def update_recording_status(
        self, db: Session, recording_id: int, status: str
    ) -> Recording:
        """Update recording processing status."""
        recording = (
            db.query(Recording)
            .filter(Recording.id == recording_id)
            .first()
        )
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        recording.processing_status = status
        db.commit()
        db.refresh(recording)
        return recording

    async def update_processing_results(
        self, db: Session, recording_id: int, results: Dict[str, Any]
    ) -> Recording:
        """Update recording with processing results."""
        recording = (
            db.query(Recording)
            .filter(Recording.id == recording_id)
            .first()
        )
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        recording.processing_results = results
        db.commit()
        db.refresh(recording)
        return recording

    async def batch_process_recordings(
        self, db: Session, recording_ids: List[int], model_id: str
    ) -> List[Dict[str, Any]]:
        """Queue multiple recordings for processing with the specified model."""
        results = []
        for recording_id in recording_ids:
            try:
                # Verify recording exists
                recording = await self.get_recording(db, recording_id, None)  # TODO: Add user_id check
                if not recording:
                    results.append({
                        "recording_id": recording_id,
                        "status": "error",
                        "error": "Recording not found"
                    })
                    continue

                # Create task entry
                task = Task(
                    name=f"Batch Process Recording {recording_id}",
                    status="queued",
                    recording_id=recording_id,
                    model_id=model_id,
                    created_at=datetime.utcnow()
                )
                db.add(task)
                db.commit()
                db.refresh(task)

                # Queue Celery task
                celery_task = process_recording.delay(recording_id, model_id)
                
                # Update task with Celery task ID
                task.celery_task_id = celery_task.id
                db.commit()

                results.append({
                    "recording_id": recording_id,
                    "task_id": celery_task.id,
                    "status": "queued"
                })

            except Exception as e:
                results.append({
                    "recording_id": recording_id,
                    "status": "error",
                    "error": str(e)
                })

        return results

    async def check_task_status(
        self, task_id: str
    ) -> Dict[str, Any]:
        """Check the status of a Celery task."""
        try:
            result = AsyncResult(task_id)
            status = {
                "task_id": task_id,
                "status": result.status
            }
            
            if result.ready():
                if result.successful():
                    status["result"] = result.get()
                else:
                    status["error"] = str(result.result)
            
            return status
            
        except Exception as e:
            return {
                "task_id": task_id,
                "status": "error",
                "error": str(e)
            }
