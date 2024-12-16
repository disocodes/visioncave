from fastapi import APIRouter, Depends, HTTPException, status, Response
from typing import List, Optional
from sqlalchemy.orm import Session
from ....models.sql_models import Recording
from ....core.deps import get_db, get_current_user
from ....services.recordings_service import RecordingsService
from fastapi.responses import StreamingResponse
import os

router = APIRouter()
recordings_service = RecordingsService()

@router.get("/", response_model=List[dict])
async def list_recordings(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of recordings with their applied tasks."""
    recordings = await recordings_service.get_recordings(db, current_user.id, skip, limit)
    return [
        {
            "id": rec.id,
            "name": rec.name,
            "created_at": rec.created_at,
            "file_path": rec.file_path,
            "applied_tasks": [
                {
                    "id": task.id,
                    "name": task.name,
                    "status": task.status,
                    "results": task.results
                }
                for task in rec.applied_tasks
            ] if hasattr(rec, 'applied_tasks') else []
        }
        for rec in recordings
    ]

@router.get("/{recording_id}")
async def get_recording(
    recording_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific recording by ID."""
    recording = await recordings_service.get_recording(db, recording_id, current_user.id)
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")

    # Check if file exists and has content
    if not os.path.exists(recording.file_path):
        raise HTTPException(
            status_code=404,
            detail="No recording content available. Please record a video first."
        )
    
    # Check file size
    file_size = os.path.getsize(recording.file_path)
    if file_size == 0:
        raise HTTPException(
            status_code=404,
            detail="No recording content available. Please record a video first."
        )

    def iterfile():
        with open(recording.file_path, mode="rb") as file:
            yield from file

    return StreamingResponse(
        iterfile(),
        media_type="video/mp4"  # Adjust content type based on actual file type
    )

@router.delete("/{recording_id}")
async def delete_recording(
    recording_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a recording."""
    success = await recordings_service.delete_recording(db, recording_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Recording not found")
    return {"message": "Recording deleted successfully"}

@router.post("/settings")
async def update_settings(
    settings: dict,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update recording settings."""
    try:
        if 'retentionPeriod' in settings:
            await recordings_service.apply_retention_rules(
                db,
                max_age_days=int(settings['retentionPeriod']),
                max_storage_gb=1000  # Default to 1TB, adjust as needed
            )
        return {"message": "Settings updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{recording_id}/tasks")
async def get_recording_tasks(
    recording_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks applied to a recording."""
    try:
        tasks = await recordings_service.get_recording_tasks(db, recording_id, current_user.id)
        return tasks
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
