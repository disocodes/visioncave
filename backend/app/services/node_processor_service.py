from typing import Dict, Any
from app.services.video_analytics_service import VideoAnalyticsService
from app.services.camera_service import CameraService
from app.services.realtime_processor import RealtimeProcessor
from app.services.websocket_service import WebsocketService

class NodeProcessorService:
    def __init__(self):
        self.video_analytics = VideoAnalyticsService()
        self.camera_service = CameraService()
        self.realtime_processor = RealtimeProcessor()
        self.websocket_service = WebsocketService()

    def process_node(self, node_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data based on node type"""
        
        # Input Nodes
        if node_type == "cameraInput":
            return self.camera_service.get_camera_feed(input_data)
        
        # Processing Nodes
        elif node_type == "imageProcessing":
            return self.video_analytics.process_frame(input_data)
            
        # Mine Site Nodes
        elif node_type == "heavyMachineryTracking":
            return self.video_analytics.process_mine_machinery(input_data)
        elif node_type == "safetyGearCompliance":
            return self.video_analytics.process_safety_compliance(input_data)
        elif node_type == "hazardousArea":
            return self.video_analytics.process_hazard_detection(input_data)
            
        # Traffic Nodes
        elif node_type == "trafficFlow":
            return self.video_analytics.process_traffic(input_data)
        elif node_type == "parkingOccupancy":
            return self.video_analytics.process_parking(input_data)
        elif node_type == "publicSafety":
            return self.video_analytics.process_public_safety(input_data)
            
        # School Nodes
        elif node_type == "classroomActivity":
            return self.video_analytics.process_classroom_activity(input_data)
        elif node_type == "studentAttendance":
            return self.video_analytics.process_student_attendance(input_data)
        elif node_type == "attentionAnalysis":
            return self.video_analytics.process_attention_analysis(input_data)
            
        # Hospital Nodes
        elif node_type == "patientMonitoring":
            return self.video_analytics.process_patient_monitoring(input_data)
        elif node_type == "staffTracking":
            return self.video_analytics.process_staff_tracking(input_data)
        elif node_type == "equipmentTracking":
            return self.video_analytics.process_equipment_tracking(input_data)
            
        # Residential Nodes
        elif node_type == "securityMonitoring":
            return self.video_analytics.process_security_monitoring(input_data)
        elif node_type == "packageDetection":
            return self.video_analytics.process_package_detection(input_data)
        elif node_type == "visitorTracking":
            return self.video_analytics.process_visitor_tracking(input_data)
            
        # Output Nodes
        elif node_type == "alert":
            return self.realtime_processor.generate_alert(input_data)
        elif node_type == "analytics":
            return self.realtime_processor.generate_analytics(input_data)
        elif node_type == "timeSeriesAnalysis":
            return self.realtime_processor.analyze_time_series(input_data)
            
        else:
            raise ValueError(f"Unknown node type: {node_type}")

    def execute_workflow(self, workflow_config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a complete workflow of connected nodes"""
        results = {}
        
        # Process nodes in topological order
        for node in workflow_config["nodes"]:
            node_id = node["id"]
            node_type = node["type"]
            node_inputs = self._get_node_inputs(node, workflow_config, results)
            
            # Process current node
            results[node_id] = self.process_node(node_type, node_inputs)
            
            # Broadcast results via WebSocket if needed
            if node.get("broadcast", False):
                self.websocket_service.broadcast_update(
                    channel=node_type,
                    data=results[node_id]
                )
                
        return results
    
    def _get_node_inputs(self, node: Dict[str, Any], workflow: Dict[str, Any], results: Dict[str, Any]) -> Dict[str, Any]:
        """Get input data for a node from its connected inputs"""
        inputs = {}
        
        # Find edges connecting to this node
        for edge in workflow["edges"]:
            if edge["target"] == node["id"]:
                source_node_id = edge["source"]
                inputs[edge["sourceHandle"]] = results[source_node_id]
                
        # Add node configuration
        inputs.update(node.get("config", {}))
        
        return inputs
