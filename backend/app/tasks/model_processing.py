from celery import shared_task
from app.core.celery_app import celery_app
from app.services.model_processor_service import ModelProcessorService
from app.services.websocket_service import websocket_service
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.models.sql_models import Recording
from .task_functions import (
    update_recording_status,
    update_recording_results,
)

@celery_app.task(bind=True, max_retries=3)
def process_recording(self, recording_id: int, model_id: str):
    """Process a recording with the specified model"""
    db: Session = next(get_db())
    try:
        # Get recording details
        recording = (
            db.query(Recording)
            .filter(Recording.id == recording_id)
            .first()
        )
        
        if not recording:
            raise ValueError(f"Recording {recording_id} not found")
        
        # Update recording status to processing
        recording.processing_status = "processing"
        db.commit()
            
        # Process the recording
        processor = ModelProcessorService()
        results = processor.process_recording(recording, model_id)
        
        # Update recording with results and status
        recording.processing_results = results
        recording.processing_status = "completed"
        db.commit()
        
        return {
            "status": "success",
            "recording_id": recording_id,
            "results": results
        }
        
    except Exception as e:
        # Update status to failed
        recording.processing_status = "failed"
        db.commit()
        
        # Log the error and retry if possible
        self.retry(exc=e, countdown=60)  # Retry after 1 minute

@celery_app.task
def batch_process_recordings(recording_ids: list[int], model_id: str):
    """Process multiple recordings with the specified model"""
    results = []
    for recording_id in recording_ids:
        try:
            # Queue individual processing task
            result = process_recording.delay(recording_id, model_id)
            results.append({
                "recording_id": recording_id,
                "task_id": result.id,
                "status": "queued"
            })
        except Exception as e:
            results.append({
                "recording_id": recording_id,
                "status": "failed",
                "error": str(e)
            })
    
    return results

@celery_app.task(name="check_processing_status")
def check_processing_status(task_ids: list[str]):
    """
    Check the status of multiple processing tasks
    
    Args:
        task_ids: List of Celery task IDs to check
    """
    results = []
    for task_id in task_ids:
        try:
            # Get AsyncResult for task
            result = celery_app.AsyncResult(task_id)
            status = {
                "task_id": task_id,
                "status": result.status
            }
            
            # Include result or error if available
            if result.ready():
                if result.successful():
                    status["result"] = result.get()
                else:
                    status["error"] = str(result.result)
                    
            results.append(status)
            
        except Exception as e:
            results.append({
                "task_id": task_id,
                "status": "error",
                "error": str(e)
            })
    
    return results
