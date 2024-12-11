import React, { memo } from 'react';
import { Handle } from 'reactflow';
import { Paper, Typography, Box } from '@mui/material';
import {
  Videocam,
  Analytics,
  NotificationsActive,
  Image,
  Timeline,
  CompareArrows,
  Person,
  DirectionsCar,
  Warning,
  Security,
  Traffic,
  LocalParking,
  HealthAndSafety,
  School,
  People,
  Psychology,
  MonitorHeart,
  Badge,
  MedicalServices,
  SecurityCamera,
  LocalShipping,
  Group,
  CenterFocusStrong,
  AccessibilityIcon,
  FaceIcon,
  SportsIcon,
  VisibilityIcon,
  DriveEtaIcon,
  SecurityIcon,
  ErrorIcon,
  PhotoCamera,
  CameraEnhance,
  FilterCenterFocus,
  AdjustSharp,
  CropFree,
  FindInPage,
  PhotoSizeSelectActual,
  CameraAlt
} from '@mui/icons-material';

// Node Types Configuration
export const baseNodeTypes = {
  // Input Nodes
  cameraInput: {
    label: 'Camera Input',
    icon: Videocam,
    color: '#4CAF50',
    category: 'input'
  },
  
  // Processing Nodes
  imageProcessing: {
    label: 'Image Processing',
    icon: Image,
    color: '#2196F3',
    category: 'processing'
  },
  
  // Mine Site Nodes
  heavyMachineryTracking: {
    label: 'Heavy Machinery Tracking',
    icon: DirectionsCar,
    color: '#FF9800',
    category: 'mine'
  },
  safetyGearCompliance: {
    label: 'Safety Gear Compliance',
    icon: Security,
    color: '#FF5722',
    category: 'mine'
  },
  hazardousArea: {
    label: 'Hazardous Area Detection',
    icon: Warning,
    color: '#F44336',
    category: 'mine'
  },

  // Traffic Nodes
  trafficFlow: {
    label: 'Traffic Flow Analysis',
    icon: Traffic,
    color: '#9C27B0',
    category: 'traffic'
  },
  parkingOccupancy: {
    label: 'Parking Occupancy',
    icon: LocalParking,
    color: '#673AB7',
    category: 'traffic'
  },
  publicSafety: {
    label: 'Public Safety',
    icon: HealthAndSafety,
    color: '#3F51B5',
    category: 'traffic'
  },

  // School Nodes
  classroomActivity: {
    label: 'Classroom Activity',
    icon: School,
    color: '#009688',
    category: 'school'
  },
  studentAttendance: {
    label: 'Student Attendance',
    icon: People,
    color: '#00BCD4',
    category: 'school'
  },
  attentionAnalysis: {
    label: 'Attention Analysis',
    icon: Psychology,
    color: '#03A9F4',
    category: 'school'
  },

  // Hospital Nodes
  patientMonitoring: {
    label: 'Patient Monitoring',
    icon: MonitorHeart,
    color: '#E91E63',
    category: 'hospital'
  },
  staffTracking: {
    label: 'Staff Tracking',
    icon: Badge,
    color: '#C2185B',
    category: 'hospital'
  },
  equipmentTracking: {
    label: 'Equipment Tracking',
    icon: MedicalServices,
    color: '#D81B60',
    category: 'hospital'
  },

  // Residential Nodes
  securityMonitoring: {
    label: 'Security Monitoring',
    icon: SecurityCamera,
    color: '#795548',
    category: 'residential'
  },
  packageDetection: {
    label: 'Package Detection',
    icon: LocalShipping,
    color: '#8D6E63',
    category: 'residential'
  },
  visitorTracking: {
    label: 'Visitor Tracking',
    icon: Group,
    color: '#6D4C41',
    category: 'residential'
  },

  // Output Nodes
  alert: {
    label: 'Alert Generation',
    icon: NotificationsActive,
    color: '#607D8B',
    category: 'output'
  },
  analytics: {
    label: 'Analytics Dashboard',
    icon: Analytics,
    color: '#455A64',
    category: 'output'
  },
  timeSeriesAnalysis: {
    label: 'Time Series Analysis',
    icon: Timeline,
    color: '#37474F',
    category: 'output'
  }
};

// Model Nodes Configuration
export const modelNodes = {
  // Object Detection Models
  yolov5: {
    label: 'YOLOv5 Detection',
    icon: CenterFocusStrong,
    color: '#2196F3',
    category: 'models',
    config: {
      model_size: {
        type: 'select',
        label: 'Model Size',
        options: ['yolov5n', 'yolov5s', 'yolov5m', 'yolov5l', 'yolov5x'],
        default: 'yolov5s'
      },
      confidence_threshold: {
        type: 'slider',
        label: 'Confidence Threshold',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.25
      },
      iou_threshold: {
        type: 'slider',
        label: 'IOU Threshold',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.45
      },
      device: {
        type: 'select',
        label: 'Device',
        options: ['cpu', 'cuda'],
        default: 'cuda'
      },
      classes: {
        type: 'multiselect',
        label: 'Classes to Detect',
        options: [
          'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
          'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
          'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
          'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
          'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
          'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
          'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
          'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
          'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
          'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
          'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
          'toothbrush'
        ],
        default: ['person']
      }
    }
  },

  // Pose Detection
  poseDetection: {
    label: 'Pose Detection',
    icon: AccessibilityIcon,
    color: '#9C27B0',
    category: 'models',
    parameters: {
      model_type: {
        type: 'select',
        options: ['movenet', 'blazepose'],
        default: 'movenet'
      },
      tracking: {
        type: 'boolean',
        default: true
      }
    }
  },

  // Face Detection & Recognition
  faceDetection: {
    label: 'Face Detection',
    icon: FaceIcon,
    color: '#FF5722',
    category: 'models',
    parameters: {
      recognition: {
        type: 'boolean',
        default: false
      },
      min_face_size: {
        type: 'number',
        min: 20,
        max: 1000,
        default: 60
      }
    }
  },

  // Activity Recognition
  activityRecognition: {
    label: 'Activity Recognition',
    icon: SportsIcon,
    color: '#4CAF50',
    category: 'models',
    parameters: {
      model_type: {
        type: 'select',
        options: ['i3d', 'slowfast'],
        default: 'i3d'
      },
      temporal_window: {
        type: 'number',
        min: 8,
        max: 64,
        default: 16
      }
    }
  },

  // Attention Analysis
  attentionAnalysisModel: {
    label: 'Attention Analysis',
    icon: VisibilityIcon,
    color: '#795548',
    category: 'models',
    parameters: {
      head_pose: {
        type: 'boolean',
        default: true
      },
      gaze_estimation: {
        type: 'boolean',
        default: true
      }
    }
  },

  // Vehicle Analysis
  vehicleAnalysis: {
    label: 'Vehicle Analysis',
    icon: DriveEtaIcon,
    color: '#607D8B',
    category: 'models',
    parameters: {
      type_classification: {
        type: 'boolean',
        default: true
      },
      license_plate: {
        type: 'boolean',
        default: false
      },
      speed_estimation: {
        type: 'boolean',
        default: true
      }
    }
  },

  // PPE Detection
  ppeDetection: {
    label: 'PPE Detection',
    icon: SecurityIcon,
    color: '#F44336',
    category: 'models',
    parameters: {
      equipment_types: {
        type: 'multiselect',
        options: ['helmet', 'vest', 'gloves', 'boots', 'goggles'],
        default: ['helmet', 'vest']
      },
      alert_on_violation: {
        type: 'boolean',
        default: true
      }
    }
  },

  // Anomaly Detection
  anomalyDetection: {
    label: 'Anomaly Detection',
    icon: ErrorIcon,
    color: '#FF9800',
    category: 'models',
    parameters: {
      sensitivity: {
        type: 'number',
        min: 0,
        max: 1,
        default: 0.5
      },
      temporal_context: {
        type: 'number',
        min: 1,
        max: 100,
        default: 30
      }
    }
  }
};

export const nodeTypes = {
  ...baseNodeTypes,
  ...modelNodes
};

const nodeStyles = {
  padding: '10px',
  borderRadius: '3px',
  width: 150,
  fontSize: '12px',
  color: '#222',
  textAlign: 'center',
  borderWidth: 1,
  borderStyle: 'solid',
};

const CustomNode = ({ data, type }) => {
  const getIcon = () => {
    switch (type) {
      case 'cameraInput':
        return <Videocam />;
      case 'imageProcessing':
        return <Image />;
      case 'heavyMachineryTracking':
        return <DirectionsCar />;
      case 'safetyGearCompliance':
        return <Security />;
      case 'hazardousArea':
        return <Warning />;
      case 'trafficFlow':
        return <Traffic />;
      case 'parkingOccupancy':
        return <LocalParking />;
      case 'publicSafety':
        return <HealthAndSafety />;
      case 'classroomActivity':
        return <School />;
      case 'studentAttendance':
        return <People />;
      case 'attentionAnalysis':
        return <Psychology />;
      case 'patientMonitoring':
        return <MonitorHeart />;
      case 'staffTracking':
        return <Badge />;
      case 'equipmentTracking':
        return <MedicalServices />;
      case 'securityMonitoring':
        return <SecurityCamera />;
      case 'packageDetection':
        return <LocalShipping />;
      case 'visitorTracking':
        return <Group />;
      case 'alert':
        return <NotificationsActive />;
      case 'analytics':
        return <Analytics />;
      case 'timeSeriesAnalysis':
        return <Timeline />;
      case 'yolov5':
        return <CenterFocusStrong />;
      case 'poseDetection':
        return <AccessibilityIcon />;
      case 'faceDetection':
        return <FaceIcon />;
      case 'activityRecognition':
        return <SportsIcon />;
      case 'attentionAnalysisModel':
        return <VisibilityIcon />;
      case 'vehicleAnalysis':
        return <DriveEtaIcon />;
      case 'ppeDetection':
        return <SecurityIcon />;
      case 'anomalyDetection':
        return <ErrorIcon />;
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        ...nodeStyles,
        borderColor: data.selected ? '#ff0072' : '#555',
      }}
    >
      <Handle
        type="target"
        position="top"
        style={{ background: '#555' }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        {getIcon()}
      </Box>
      
      <Typography variant="subtitle2">
        {data.label}
      </Typography>
      
      <Handle
        type="source"
        position="bottom"
        style={{ background: '#555' }}
      />
    </Paper>
  );
};

export const CameraInputNode = memo((props) => (
  <CustomNode {...props} type="cameraInput" />
));

export const ImageProcessingNode = memo((props) => (
  <CustomNode {...props} type="imageProcessing" />
));

export const HeavyMachineryTrackingNode = memo((props) => (
  <CustomNode {...props} type="heavyMachineryTracking" />
));

export const SafetyGearComplianceNode = memo((props) => (
  <CustomNode {...props} type="safetyGearCompliance" />
));

export const HazardousAreaNode = memo((props) => (
  <CustomNode {...props} type="hazardousArea" />
));

export const TrafficFlowNode = memo((props) => (
  <CustomNode {...props} type="trafficFlow" />
));

export const ParkingOccupancyNode = memo((props) => (
  <CustomNode {...props} type="parkingOccupancy" />
));

export const PublicSafetyNode = memo((props) => (
  <CustomNode {...props} type="publicSafety" />
));

export const ClassroomActivityNode = memo((props) => (
  <CustomNode {...props} type="classroomActivity" />
));

export const StudentAttendanceNode = memo((props) => (
  <CustomNode {...props} type="studentAttendance" />
));

export const AttentionAnalysisNode = memo((props) => (
  <CustomNode {...props} type="attentionAnalysis" />
));

export const PatientMonitoringNode = memo((props) => (
  <CustomNode {...props} type="patientMonitoring" />
));

export const StaffTrackingNode = memo((props) => (
  <CustomNode {...props} type="staffTracking" />
));

export const EquipmentTrackingNode = memo((props) => (
  <CustomNode {...props} type="equipmentTracking" />
));

export const SecurityMonitoringNode = memo((props) => (
  <CustomNode {...props} type="securityMonitoring" />
));

export const PackageDetectionNode = memo((props) => (
  <CustomNode {...props} type="packageDetection" />
));

export const VisitorTrackingNode = memo((props) => (
  <CustomNode {...props} type="visitorTracking" />
));

export const AlertNode = memo((props) => (
  <CustomNode {...props} type="alert" />
));

export const AnalyticsNode = memo((props) => (
  <CustomNode {...props} type="analytics" />
));

export const TimeSeriesAnalysisNode = memo((props) => (
  <CustomNode {...props} type="timeSeriesAnalysis" />
));

export const YOLOV5Node = memo((props) => (
  <CustomNode {...props} type="yolov5" />
));

export const PoseDetectionNode = memo((props) => (
  <CustomNode {...props} type="poseDetection" />
));

export const FaceDetectionNode = memo((props) => (
  <CustomNode {...props} type="faceDetection" />
));

export const ActivityRecognitionNode = memo((props) => (
  <CustomNode {...props} type="activityRecognition" />
));

export const AttentionAnalysisModelNode = memo((props) => (
  <CustomNode {...props} type="attentionAnalysisModel" />
));

export const VehicleAnalysisNode = memo((props) => (
  <CustomNode {...props} type="vehicleAnalysis" />
));

export const PPEDetectionNode = memo((props) => (
  <CustomNode {...props} type="ppeDetection" />
));

export const AnomalyDetectionNode = memo((props) => (
  <CustomNode {...props} type="anomalyDetection" />
));

export default {
  cameraInput: CameraInputNode,
  imageProcessing: ImageProcessingNode,
  heavyMachineryTracking: HeavyMachineryTrackingNode,
  safetyGearCompliance: SafetyGearComplianceNode,
  hazardousArea: HazardousAreaNode,
  trafficFlow: TrafficFlowNode,
  parkingOccupancy: ParkingOccupancyNode,
  publicSafety: PublicSafetyNode,
  classroomActivity: ClassroomActivityNode,
  studentAttendance: StudentAttendanceNode,
  attentionAnalysis: AttentionAnalysisNode,
  patientMonitoring: PatientMonitoringNode,
  staffTracking: StaffTrackingNode,
  equipmentTracking: EquipmentTrackingNode,
  securityMonitoring: SecurityMonitoringNode,
  packageDetection: PackageDetectionNode,
  visitorTracking: VisitorTrackingNode,
  alert: AlertNode,
  analytics: AnalyticsNode,
  timeSeriesAnalysis: TimeSeriesAnalysisNode,
  yolov5: YOLOV5Node,
  poseDetection: PoseDetectionNode,
  faceDetection: FaceDetectionNode,
  activityRecognition: ActivityRecognitionNode,
  attentionAnalysisModel: AttentionAnalysisModelNode,
  vehicleAnalysis: VehicleAnalysisNode,
  ppeDetection: PPEDetectionNode,
  anomalyDetection: AnomalyDetectionNode,
};
