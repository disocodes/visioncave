from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Recording, Task
from datetime import datetime, timedelta
import boto3
from google.oauth2.credentials import Credentials
from google.cloud import storage
import nextcloud_client
import os

class RecordingsService:
    def __init__(self):
        self.storage_handlers = {
            'aws-s3': self.handle_s3_storage,
            'google-drive': self.handle_google_drive,
            'nextcloud': self.handle_nextcloud,
        }

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

    async def upload_to_cloud(
        self, recording_id: int, provider: str, credentials: Dict[str, Any]
    ) -> str:
        """Upload a recording to the specified cloud storage provider."""
        try:
            handler = self.storage_handlers.get(provider)
            if not handler:
                raise ValueError(f"Unsupported storage provider: {provider}")

            return await handler(recording_id, credentials)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def handle_s3_storage(
        self, recording_id: int, credentials: Dict[str, Any]
    ) -> str:
        """Handle upload to AWS S3."""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=credentials['access_key_id'],
                aws_secret_access_key=credentials['secret_access_key'],
            )

            bucket_name = credentials['bucket_name']
            file_key = f'recordings/{recording_id}'

            # Upload file
            s3_client.upload_file(
                f'/path/to/recordings/{recording_id}.mp4',
                bucket_name,
                file_key,
            )

            return f's3://{bucket_name}/{file_key}'
        except Exception as e:
            raise ValueError(f"Failed to upload to S3: {str(e)}")

    async def handle_google_drive(
        self, recording_id: int, credentials: Dict[str, Any]
    ) -> str:
        """Handle upload to Google Drive."""
        try:
            creds = Credentials.from_authorized_user_info(credentials)
            storage_client = storage.Client(credentials=creds)
            bucket_name = credentials['bucket_name']
            bucket = storage_client.bucket(bucket_name)

            blob_name = f'recordings/{recording_id}'
            blob = bucket.blob(blob_name)

            # Upload file
            blob.upload_from_filename(f'/path/to/recordings/{recording_id}.mp4')

            return f'gs://{bucket_name}/{blob_name}'
        except Exception as e:
            raise ValueError(f"Failed to upload to Google Drive: {str(e)}")

    async def handle_nextcloud(
        self, recording_id: int, credentials: Dict[str, Any]
    ) -> str:
        """Handle upload to Nextcloud."""
        try:
            nc = nextcloud_client.Client(
                credentials['server_url'],
                auth=(credentials['username'], credentials['password'])
            )

            remote_path = f'/recordings/{recording_id}.mp4'
            local_path = f'/path/to/recordings/{recording_id}.mp4'

            # Upload file
            nc.put_file(remote_path, local_path)

            return f"{credentials['server_url']}/remote.php/dav/files/{credentials['username']}{remote_path}"
        except Exception as e:
            raise ValueError(f"Failed to upload to Nextcloud: {str(e)}")

    async def get_recording_tasks(
        self, db: Session, recording_id: int, user_id: int
    ) -> List[Task]:
        """Get tasks applied to a recording."""
        recording = await self.get_recording(db, recording_id, user_id)
        if not recording:
            raise HTTPException(status_code=404, detail="Recording not found")
        
        return recording.applied_tasks
