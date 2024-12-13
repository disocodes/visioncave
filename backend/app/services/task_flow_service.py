from typing import Dict, Any, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models.sql_models import Task, Recording
import networkx as nx

class TaskFlowService:
    def __init__(self):
        self.node_processors = {
            'objectDetection': self.process_object_detection,
            'personTracking': self.process_person_tracking,
            'vehicleTracking': self.process_vehicle_tracking,
            'analytics': self.process_analytics,
            'filter': self.process_filter,
            'region': self.process_region,
            'countLine': self.process_count_line,
            'vlm': self.process_vlm,
        }

    async def create_task(
        self, db: Session, name: str, configuration: Dict[str, Any], target_type: str, user_id: int
    ) -> Task:
        """Create a new task from the visual builder configuration."""
        try:
            # Validate the task configuration
            self.validate_task_configuration(configuration)
            
            # Create task record
            task = Task(
                name=name,
                configuration=configuration,
                target_type=target_type,
                owner_id=user_id
            )
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            return task
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    def validate_task_configuration(self, configuration: Dict[str, Any]):
        """Validate the task configuration structure and node connections."""
        nodes = configuration.get('nodes', [])
        edges = configuration.get('edges', [])
        
        if not nodes:
            raise ValueError("Task must contain at least one node")
        
        # Create a graph to validate connections
        graph = nx.DiGraph()
        
        # Add nodes
        for node in nodes:
            graph.add_node(node['id'], type=node['type'])
        
        # Add edges
        for edge in edges:
            graph.add_edge(edge['source'], edge['target'])
        
        # Validate that there are no cycles
        if not nx.is_directed_acyclic_graph(graph):
            raise ValueError("Task configuration contains cycles")

    async def apply_task_to_recording(
        self, db: Session, task_id: int, recording_id: int
    ) -> Recording:
        """Apply a task to a recording."""
        try:
            # Get task and recording
            task = db.query(Task).filter(Task.id == task_id).first()
            recording = db.query(Recording).filter(Recording.id == recording_id).first()
            
            if not task or not recording:
                raise ValueError("Task or recording not found")
            
            # Update recording with task information
            recording.applied_tasks.append(task)
            
            db.commit()
            db.refresh(recording)
            
            return recording
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=str(e))

    # Node Processors
    async def process_object_detection(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process object detection node."""
        return {
            'type': 'detection_result',
            'objects': [
                {'class': 'person', 'confidence': 0.95, 'bbox': [100, 100, 200, 200]},
                {'class': 'car', 'confidence': 0.87, 'bbox': [300, 300, 500, 400]},
            ],
        }

    async def process_person_tracking(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process person tracking node."""
        return {
            'type': 'tracking_result',
            'tracks': [
                {'id': 1, 'position': [150, 150], 'velocity': [1, 0]},
            ],
        }

    async def process_vehicle_tracking(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process vehicle tracking node."""
        return {
            'type': 'tracking_result',
            'tracks': [
                {'id': 1, 'type': 'car', 'position': [400, 350], 'velocity': [-1, 0]},
            ],
        }

    async def process_analytics(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process analytics node."""
        return {
            'type': 'analytics_result',
            'metrics': {
                'object_count': 2,
                'average_speed': 5.2,
                'direction_histogram': {'north': 0.3, 'south': 0.7},
            },
        }

    async def process_filter(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process filter node."""
        return {
            'type': 'filter_result',
            'filter_type': config.get('filter_type'),
            'parameters': config.get('parameters', {}),
        }

    async def process_region(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process region node."""
        return {
            'type': 'region_result',
            'region': config.get('region'),
            'focus_area': config.get('focus_area', {}),
        }

    async def process_count_line(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process count line node."""
        return {
            'type': 'count_line_result',
            'line': config.get('line'),
            'counts': {'in': 5, 'out': 3},
        }

    async def process_vlm(self, config: Dict[str, Any], input_data: Dict[str, Any]):
        """Process VLM node."""
        return {
            'type': 'vlm_result',
            'model': config.get('model'),
            'predictions': [
                {'label': 'person walking', 'confidence': 0.92},
                {'label': 'car parked', 'confidence': 0.88},
            ],
        }
