import logging
import random
from typing import Dict
from datetime import datetime
from .websocket_service import websocket_service

logger = logging.getLogger(__name__)

class VideoAnalyticsService:
    """Mock implementation for local development"""
    def __init__(self):
        self.processing_modules = {
            'residential': self.process_residential,
            'school': self.process_school,
            'hospital': self.process_hospital,
            'mine': self.process_mine,
            'traffic': self.process_traffic,
            'yolov5': self.process_yolov5
        }

    async def initialize_models(self):
        """Mock model initialization"""
        logger.info("Mock models initialized successfully")

    async def process_frame(self, frame, module_type: str) -> Dict:
        """Mock frame processing"""
        if module_type not in self.processing_modules:
            raise ValueError(f"Unknown module type: {module_type}")
        
        return await self.processing_modules[module_type](frame)

    async def process_residential(self, frame) -> Dict:
        """Mock residential processing"""
        people_count = random.randint(0, 5)
        package_detections = []
        
        if random.random() > 0.7:  # 30% chance of package detection
            package_detections.append({
                'id': f"pkg_{datetime.now().timestamp()}",
                'confidence': random.uniform(0.7, 0.95),
                'bbox': [random.uniform(0, 0.8) for _ in range(4)]
            })

        # Broadcast updates to all sites (in development mode)
        for site_id in websocket_service.active_connections.keys():
            await websocket_service.broadcast_to_site(site_id, {
                'type': 'occupancy_update',
                'current_occupancy': people_count
            })

            if package_detections:
                await websocket_service.broadcast_to_site(site_id, {
                    'type': 'package_detection',
                    'event': 'new_package',
                    'packages': package_detections
                })

        return {
            'occupancy': people_count,
            'packages': package_detections
        }

    async def process_school(self, frame) -> Dict:
        """Mock school processing"""
        student_count = random.randint(15, 30)
        attention_score = random.uniform(0.7, 1.0)
        
        return {
            'student_count': student_count,
            'attention_score': attention_score
        }

    async def process_hospital(self, frame) -> Dict:
        """Mock hospital processing"""
        people_count = random.randint(0, 10)
        fall_detected = random.random() > 0.95  # 5% chance of fall detection
        
        return {
            'people_count': people_count,
            'fall_detected': fall_detected
        }

    async def process_mine(self, frame) -> Dict:
        """Mock mine processing"""
        vehicle_count = random.randint(0, 5)
        
        return {
            'vehicle_count': vehicle_count
        }

    async def process_traffic(self, frame) -> Dict:
        """Mock traffic processing"""
        vehicle_count = random.randint(5, 20)
        
        return {
            'vehicle_count': vehicle_count,
            'traffic_density': vehicle_count / 100  # Normalized density
        }

    async def process_yolov5(self, frame, config: dict = None) -> Dict:
        """Mock YOLOv5 processing"""
        if config is None:
            config = {}
            
        classes = config.get('classes', ['person', 'car', 'truck'])
        num_detections = random.randint(1, 5)
        
        formatted_detections = []
        for _ in range(num_detections):
            formatted_detections.append({
                'bbox': [random.uniform(0, 0.8) for _ in range(4)],
                'class': random.choice(classes),
                'confidence': random.uniform(0.6, 0.95)
            })
        
        # Prepare response
        response = {
            'detections': formatted_detections,
            'count': len(formatted_detections),
            'classes': classes,  # Use the input classes list
            'timestamp': datetime.now().isoformat()
        }
        
        # Send results through websocket to all sites (in development mode)
        for site_id in websocket_service.active_connections.keys():
            await websocket_service.broadcast_to_site(site_id, {
                'type': 'yolov5_detection',
                'data': response
            })
        
        return response

video_analytics_service = VideoAnalyticsService()
