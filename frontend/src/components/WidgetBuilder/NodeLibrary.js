import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Videocam,
  Analytics,
  Person,
  LocalParking,
  Warning,
  Timeline,
  Security,
  School,
  LocalHospital,
  Construction,
  TrafficOutlined,
  Settings,
  Engineering,
  SafetyCheck,
  ReportProblem,
  DirectionsCar,
  LocalShipping,
  People,
  Class,
  AssignmentInd,
  Psychology,
  MonitorHeart,
  PersonPin,
  Inventory,
  LocalShippingOutlined,
  Visibility,
  Face,
  SportsKabaddi,
  PrecisionManufacturing,
  HealthAndSafety,
  BugReport,
} from '@mui/icons-material';

const nodeCategories = [
  {
    title: 'Input Nodes',
    nodes: [
      { type: 'camera', name: 'Camera Input', icon: Videocam, description: 'Capture video feed from camera' },
      { type: 'file', name: 'File Input', icon: Timeline, description: 'Load video or image files' },
    ],
  },
  {
    title: 'Processing Nodes',
    nodes: [
      { type: 'yolov5', name: 'YOLO v5', icon: Visibility, description: 'Deep learning object detection' },
      { type: 'poseDetection', name: 'Pose Detection', icon: SportsKabaddi, description: 'Human pose estimation' },
      { type: 'faceDetection', name: 'Face Detection', icon: Face, description: 'Facial detection and recognition' },
      { type: 'activityRecognition', name: 'Activity Recognition', icon: Timeline, description: 'Analyze human activities' },
      { type: 'anomalyDetection', name: 'Anomaly Detection', icon: BugReport, description: 'Detect unusual patterns' },
    ],
  },
  {
    title: 'Mine Site Nodes',
    nodes: [
      { type: 'heavyMachineryTracking', name: 'Heavy Machinery Tracking', icon: Engineering, description: 'Track heavy machinery movement' },
      { type: 'safetyGearCompliance', name: 'Safety Gear Compliance', icon: SafetyCheck, description: 'Monitor PPE compliance' },
      { type: 'hazardousArea', name: 'Hazardous Area', icon: ReportProblem, description: 'Monitor dangerous zones' },
      { type: 'ppeDetection', name: 'PPE Detection', icon: HealthAndSafety, description: 'Detect personal protective equipment' },
    ],
  },
  {
    title: 'Traffic Nodes',
    nodes: [
      { type: 'trafficFlow', name: 'Traffic Flow', icon: DirectionsCar, description: 'Monitor traffic patterns' },
      { type: 'parkingOccupancy', name: 'Parking Occupancy', icon: LocalParking, description: 'Track parking space usage' },
      { type: 'vehicleAnalysis', name: 'Vehicle Analysis', icon: LocalShipping, description: 'Analyze vehicle types and patterns' },
    ],
  },
  {
    title: 'School Nodes',
    nodes: [
      { type: 'classroomActivity', name: 'Classroom Activity', icon: Class, description: 'Monitor classroom activities' },
      { type: 'studentAttendance', name: 'Student Attendance', icon: AssignmentInd, description: 'Track student attendance' },
      { type: 'attentionAnalysis', name: 'Attention Analysis', icon: Psychology, description: 'Analyze student attention' },
    ],
  },
  {
    title: 'Hospital Nodes',
    nodes: [
      { type: 'patientMonitoring', name: 'Patient Monitoring', icon: MonitorHeart, description: 'Monitor patient activity' },
      { type: 'staffTracking', name: 'Staff Tracking', icon: PersonPin, description: 'Track medical staff' },
      { type: 'equipmentTracking', name: 'Equipment Tracking', icon: Inventory, description: 'Track medical equipment' },
    ],
  },
  {
    title: 'Residential Nodes',
    nodes: [
      { type: 'securityMonitoring', name: 'Security Monitoring', icon: Security, description: 'Monitor security events' },
      { type: 'packageDetection', name: 'Package Detection', icon: LocalShippingOutlined, description: 'Detect package delivery' },
      { type: 'visitorTracking', name: 'Visitor Tracking', icon: Person, description: 'Track visitor activity' },
    ],
  },
  {
    title: 'Output Nodes',
    nodes: [
      { type: 'alert', name: 'Alert', icon: Warning, description: 'Generate alerts based on conditions' },
      { type: 'analytics', name: 'Analytics', icon: Analytics, description: 'Display analytics data' },
      { type: 'timeSeriesAnalysis', name: 'Time Series Analysis', icon: Timeline, description: 'Analyze temporal patterns' },
    ],
  },
];

const NodeLibrary = () => {
  const onDragStart = (event, nodeType, nodeName) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('nodeName', nodeName);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Node Library
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag and drop nodes to create your widget
      </Typography>

      {nodeCategories.map((category, index) => (
        <Box key={index} sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', mb: 1 }}
          >
            {category.title}
          </Typography>
          <List dense>
            {category.nodes.map((node, nodeIndex) => (
              <Tooltip
                key={nodeIndex}
                title={node.description}
                placement="right"
              >
                <ListItem
                  button
                  draggable
                  onDragStart={(event) => onDragStart(event, node.type, node.name)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    <node.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={node.name}
                    primaryTypographyProps={{
                      variant: 'body2',
                    }}
                  />
                </ListItem>
              </Tooltip>
            ))}
          </List>
          {index < nodeCategories.length - 1 && <Divider sx={{ my: 2 }} />}
        </Box>
      ))}
    </Box>
  );
};

export default NodeLibrary;
