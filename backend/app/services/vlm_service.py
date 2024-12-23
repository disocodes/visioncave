from typing import Dict, Any, List
from fastapi import HTTPException
import requests
import json
import os
from sqlalchemy.orm import Session
from ..models.sql_models import VLMModel
import logging
from requests.exceptions import RequestException

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VLMService:
    def __init__(self):
        self.available_models = {
            'yolov8': {
                'name': 'YOLOv8',
                'description': 'General purpose object detection model',
                'type': 'detection',
            },
            'sam': {
                'name': 'Segment Anything Model',
                'description': 'Advanced segmentation model',
                'type': 'segmentation',
            },
            'clip': {
                'name': 'CLIP',
                'description': 'Vision-language understanding model',
                'type': 'multimodal',
            },
        }

    async def get_available_models(self, db: Session) -> List[Dict[str, Any]]:
        """Get list of available VLM models."""
        try:
            # Get built-in models
            models = [
                {
                    'id': model_id,
                    'name': info['name'],
                    'description': info['description'],
                    'type': info['type'],
                    'built_in': True,
                }
                for model_id, info in self.available_models.items()
            ]

            # Get custom models from database
            custom_models = db.query(VLMModel).all()
            models.extend([
                {
                    'id': f'custom-{model.id}',
                    'name': model.name,
                    'description': model.description,
                    'type': model.type,
                    'built_in': False,
                    'endpoint': model.endpoint,
                }
                for model in custom_models
            ])

            return models
        except Exception as e:
            logger.error(f"Error getting available models: {str(e)}")
            raise HTTPException(status_code=500, detail="Error retrieving models")

    async def register_custom_model(
        self, db: Session, name: str, description: str, model_type: str,
        endpoint: str, model_path: str
    ) -> VLMModel:
        """Register a new custom VLM model."""
        try:
            # Validate the model endpoint
            if not await self.validate_model_endpoint(endpoint):
                raise ValueError("Invalid model endpoint")

            model = VLMModel(
                name=name,
                description=description,
                type=model_type,
                endpoint=endpoint,
                model_path=model_path,
            )

            db.add(model)
            db.commit()
            db.refresh(model)
            logger.info(f"Registered new custom model: {name}")

            return model
        except Exception as e:
            db.rollback()
            logger.error(f"Error registering custom model: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def validate_model_endpoint(self, endpoint: str) -> bool:
        """Validate that a custom model endpoint is accessible."""
        try:
            response = requests.get(
                f"{endpoint}/health",
                timeout=5,
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            return True
        except RequestException as e:
            logger.warning(f"Model endpoint validation failed: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error validating endpoint: {str(e)}")
            return False

    async def process_frame(
        self, db: Session, frame_data: bytes, model_id: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a frame using the specified VLM model."""
        try:
            if model_id in self.available_models:
                # Use built-in model
                return await self.process_with_built_in_model(
                    frame_data, model_id, config
                )
            elif model_id.startswith('custom-'):
                # Use custom model
                return await self.process_with_custom_model(
                    db, frame_data, model_id.replace('custom-', ''), config
                )
            else:
                raise ValueError(f"Unknown model ID: {model_id}")
        except Exception as e:
            logger.error(f"Error processing frame: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def process_with_built_in_model(
        self, frame_data: bytes, model_id: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a frame using a built-in model."""
        try:
            model_info = self.available_models[model_id]
            
            if model_info['type'] == 'detection':
                return await self.run_detection(frame_data, config)
            elif model_info['type'] == 'segmentation':
                return await self.run_segmentation(frame_data, config)
            elif model_info['type'] == 'multimodal':
                return await self.run_multimodal(frame_data, config)
            else:
                raise ValueError(f"Unsupported model type: {model_info['type']}")
        except Exception as e:
            logger.error(f"Error with built-in model: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))

    async def process_with_custom_model(
        self, db: Session, frame_data: bytes, model_id: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a frame using a custom model."""
        try:
            # Get model details from database
            model = db.query(VLMModel).filter(VLMModel.id == model_id).first()
            if not model:
                raise ValueError(f"Custom model not found: {model_id}")

            # Send request to custom model endpoint
            try:
                response = requests.post(
                    f"{model.endpoint}/process",
                    files={'frame': frame_data},
                    data={'config': json.dumps(config)},
                    timeout=30,
                    headers={"Accept": "application/json"}
                )
                response.raise_for_status()
                return response.json()
            except RequestException as e:
                logger.error(f"Error communicating with custom model: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail="Model service unavailable"
                )

        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            logger.error(f"Unexpected error with custom model: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def run_detection(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run object detection on a frame."""
        try:
            # TODO: Implement actual detection logic
            return {
                'type': 'detection',
                'objects': [
                    {
                        'class': 'person',
                        'confidence': 0.95,
                        'bbox': [100, 100, 200, 200]
                    },
                ]
            }
        except Exception as e:
            logger.error(f"Error in detection: {str(e)}")
            raise HTTPException(status_code=500, detail="Detection failed")

    async def run_segmentation(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run segmentation on a frame."""
        try:
            # TODO: Implement actual segmentation logic
            return {
                'type': 'segmentation',
                'masks': [
                    {
                        'class': 'person',
                        'confidence': 0.95,
                        'mask': [[0, 0, 1, 1], [1, 1, 0, 0]]
                    },
                ]
            }
        except Exception as e:
            logger.error(f"Error in segmentation: {str(e)}")
            raise HTTPException(status_code=500, detail="Segmentation failed")

    async def run_multimodal(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run multimodal analysis on a frame."""
        try:
            # TODO: Implement actual multimodal analysis logic
            return {
                'type': 'multimodal',
                'description': 'A person walking on the street',
                'confidence': 0.92,
                'attributes': {
                    'time_of_day': 'daytime',
                    'weather': 'sunny',
                    'activity': 'walking'
                }
            }
        except Exception as e:
            logger.error(f"Error in multimodal analysis: {str(e)}")
            raise HTTPException(status_code=500, detail="Multimodal analysis failed")
