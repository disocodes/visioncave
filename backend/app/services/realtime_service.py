from fastapi import WebSocket
from typing import Dict, Set, Any
import asyncio
import json
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.data_processors = {
            'occupancy': OccupancyProcessor(),
            'traffic': TrafficProcessor(),
            'safety': SafetyProcessor(),
            'analytics': AnalyticsProcessor(),
        }

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, client_id: str):
        self.active_connections[client_id].remove(websocket)
        if not self.active_connections[client_id]:
            del self.active_connections[client_id]

    async def send_personal_message(self, message: Dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, client_id: str, message: Dict):
        if client_id in self.active_connections:
            for connection in self.active_connections[client_id]:
                await connection.send_json(message)

    async def process_message(self, message: Dict, client_id: str):
        msg_type = message.get('type')
        if msg_type in self.data_processors:
            processor = self.data_processors[msg_type]
            response = await processor.process(message.get('payload', {}))
            await self.broadcast(client_id, {
                'type': f'{msg_type}_update',
                'payload': response
            })

class OccupancyProcessor:
    def __init__(self):
        self.zones = {
            1: {'id': 1, 'name': 'Main Hall', 'capacity': 100, 'current': 0},
            2: {'id': 2, 'name': 'Cafeteria', 'capacity': 50, 'current': 0},
            3: {'id': 3, 'name': 'Library', 'capacity': 30, 'current': 0},
        }

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        total_current = sum(zone['current'] for zone in self.zones.values())
        total_capacity = sum(zone['capacity'] for zone in self.zones.values())

        return {
            'zones': list(self.zones.values()),
            'total': {
                'current': total_current,
                'capacity': total_capacity
            }
        }

class TrafficProcessor:
    def __init__(self):
        self.current_flow = 0
        self.avg_speed = 0
        self.congestion_level = 0
        self.hourly_data = []

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'currentFlow': self.current_flow,
            'avgSpeed': self.avg_speed,
            'congestionLevel': self.congestion_level,
            'flowChange': 0,
            'speedChange': 0,
            'congestionChange': 0,
            'hourlyData': self.hourly_data
        }

class SafetyProcessor:
    def __init__(self):
        self.violations = 0
        self.warnings = 0
        self.compliant = 0
        self.recent_events = []

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'status': 'normal',
            'stats': {
                'violations': self.violations,
                'warnings': self.warnings,
                'compliant': self.compliant
            },
            'recentEvents': self.recent_events
        }

class AnalyticsProcessor:
    def __init__(self):
        self.detection_rate = 0
        self.accuracy = 0
        self.processing_time = 0
        self.objects_detected = 0

    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'detectionRate': self.detection_rate,
            'accuracy': self.accuracy,
            'processingTime': self.processing_time,
            'objectsDetected': self.objects_detected
        }

manager = ConnectionManager()
