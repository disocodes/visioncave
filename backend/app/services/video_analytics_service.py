import cv2
import numpy as np
import torch
from typing import Dict, List, Tuple
import asyncio
import logging
from datetime import datetime
from .websocket_service import manager

logger = logging.getLogger(__name__)

class VideoAnalyticsService:
    def __init__(self):
        self.models = {}
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.processing_modules = {
            'residential': self.process_residential,
            'school': self.process_school,
            'hospital': self.process_hospital,
            'mine': self.process_mine,
            'traffic': self.process_traffic,
            'yolov5': self.process_yolov5
        }

    async def initialize_models(self):
        """Initialize all necessary ML models"""
        try:
            # Initialize different YOLOv5 model sizes
            model_sizes = ['yolov5s']  # Start with small model, add others as needed
            for size in model_sizes:
                self.models[size] = torch.hub.load('ultralytics/yolov5', size, pretrained=True)
                self.models[size].to(self.device)
            logger.info("Models initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing models: {str(e)}")
            raise

    async def process_frame(self, frame: np.ndarray, module_type: str) -> Dict:
        """Process a single frame based on module type"""
        if module_type not in self.processing_modules:
            raise ValueError(f"Unknown module type: {module_type}")
        
        return await self.processing_modules[module_type](frame)

    async def process_residential(self, frame: np.ndarray) -> Dict:
        """Process frame for residential module"""
        results = self.models['yolov5s'](frame)
        detections = results.pandas().xyxy[0]
        
        # Count people
        people_count = len(detections[detections['name'] == 'person'])
        
        # Detect packages
        packages = detections[detections['name'].isin(['suitcase', 'backpack', 'handbag'])]
        package_detections = []
        
        for _, pkg in packages.iterrows():
            package_detections.append({
                'id': f"pkg_{datetime.now().timestamp()}",
                'confidence': float(pkg['confidence']),
                'bbox': [float(pkg['xmin']), float(pkg['ymin']), 
                        float(pkg['xmax']), float(pkg['ymax'])]
            })

        # Broadcast updates
        await manager.broadcast_to_module({
            'type': 'occupancy_update',
            'current_occupancy': people_count
        }, 'residential')

        if package_detections:
            await manager.broadcast_to_module({
                'type': 'package_detection',
                'event': 'new_package',
                'packages': package_detections
            }, 'residential')

        return {
            'occupancy': people_count,
            'packages': package_detections
        }

    async def process_school(self, frame: np.ndarray) -> Dict:
        """Process frame for school module"""
        results = self.models['yolov5s'](frame)
        detections = results.pandas().xyxy[0]
        
        # Count students
        student_count = len(detections[detections['name'] == 'person'])
        
        # Basic attention analysis (placeholder)
        attention_score = np.random.uniform(0.7, 1.0)  # Replace with actual implementation
        
        return {
            'student_count': student_count,
            'attention_score': attention_score
        }

    async def process_hospital(self, frame: np.ndarray) -> Dict:
        """Process frame for hospital module"""
        results = self.models['yolov5s'](frame)
        detections = results.pandas().xyxy[0]
        
        # Detect people and their poses
        people = detections[detections['name'] == 'person']
        
        # Basic fall detection (placeholder)
        fall_detected = False
        
        return {
            'people_count': len(people),
            'fall_detected': fall_detected
        }

    async def process_mine(self, frame: np.ndarray) -> Dict:
        """Process frame for mine site module"""
        results = self.models['yolov5s'](frame)
        detections = results.pandas().xyxy[0]
        
        # Detect vehicles and equipment
        vehicles = detections[detections['name'].isin(['truck', 'car'])]
        
        return {
            'vehicle_count': len(vehicles)
        }

    async def process_traffic(self, frame: np.ndarray) -> Dict:
        """Process frame for traffic module"""
        results = self.models['yolov5s'](frame)
        detections = results.pandas().xyxy[0]
        
        # Count vehicles
        vehicles = detections[detections['name'].isin(['car', 'truck', 'bus', 'motorcycle'])]
        
        return {
            'vehicle_count': len(vehicles),
            'traffic_density': len(vehicles) / 100  # Normalized density
        }

    async def process_yolov5(self, frame: np.ndarray, config: dict = None) -> Dict:
        """Process frame using YOLOv5 model with custom configuration"""
        if config is None:
            config = {}
        
        model_size = config.get('model_size', 'yolov5s')
        conf_threshold = config.get('confidence_threshold', 0.25)
        iou_threshold = config.get('iou_threshold', 0.45)
        classes = config.get('classes', None)
        
        # Initialize model if not already loaded
        if model_size not in self.models:
            self.models[model_size] = torch.hub.load('ultralytics/yolov5', model_size, pretrained=True)
            self.models[model_size].to(self.device)
        
        # Convert frame to RGB (YOLOv5 expects RGB)
        if len(frame.shape) == 3 and frame.shape[2] == 3:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        else:
            frame_rgb = frame
            
        # Run inference
        model = self.models[model_size]
        results = model(frame_rgb)
        
        # Filter detections based on confidence and classes
        detections = results.pandas().xyxy[0]
        detections = detections[detections['confidence'] >= conf_threshold]
        
        if classes:
            detections = detections[detections['name'].isin(classes)]
        
        # Format results
        formatted_detections = []
        for _, detection in detections.iterrows():
            formatted_detections.append({
                'bbox': [
                    float(detection['xmin']),
                    float(detection['ymin']),
                    float(detection['xmax']),
                    float(detection['ymax'])
                ],
                'class': detection['name'],
                'confidence': float(detection['confidence'])
            })
        
        # Prepare response
        response = {
            'detections': formatted_detections,
            'count': len(formatted_detections),
            'classes': detections['name'].unique().tolist(),
            'timestamp': datetime.now().isoformat()
        }
        
        # Send results through websocket
        await manager.broadcast_json({
            'type': 'yolov5_detection',
            'data': response
        })
        
        return response

video_analytics_service = VideoAnalyticsService()
