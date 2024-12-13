from typing import Dict, Any, List
from fastapi import HTTPException
import requests
import json
import os
from ..models.sql_models import VLMModel

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

    async def get_available_models(self, db) -> List[Dict[str, Any]]:
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
            raise HTTPException(status_code=400, detail=str(e))

    async def register_custom_model(
        self, db, name: str, description: str, model_type: str,
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

            return model
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    async def validate_model_endpoint(self, endpoint: str) -> bool:
        """Validate that a custom model endpoint is accessible."""
        try:
            response = requests.get(f"{endpoint}/health", timeout=5)
            return response.status_code == 200
        except:
            return False

    async def process_frame(
        self, frame_data: bytes, model_id: str, config: Dict[str, Any]
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
                    frame_data, model_id.replace('custom-', ''), config
                )
            else:
                raise ValueError(f"Unknown model ID: {model_id}")
        except Exception as e:
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
            raise HTTPException(status_code=400, detail=str(e))

    async def process_with_custom_model(
        self, frame_data: bytes, model_id: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a frame using a custom model."""
        try:
            # Get model details from database
            model = self.db.query(VLMModel).filter(VLMModel.id == model_id).first()
            if not model:
                raise ValueError(f"Custom model not found: {model_id}")

            # Send request to custom model endpoint
            response = requests.post(
                f"{model.endpoint}/process",
                files={'frame': frame_data},
                data={'config': json.dumps(config)},
                timeout=30
            )

            if response.status_code != 200:
                raise ValueError(f"Model processing failed: {response.text}")

            return response.json()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    async def run_detection(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run object detection on a frame."""
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

    async def run_segmentation(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run segmentation on a frame."""
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

    async def run_multimodal(
        self, frame_data: bytes, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run multimodal analysis on a frame."""
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
