from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.sql_models import (
    Patient, PatientMonitoringRecord, MedicalAlert,
    AlertResponse, StaffLocation, User, Site, Zone
)
from app.services.vision_service import VisionService
from app.services.realtime_processor import RealtimeProcessor

class HospitalService:
    def __init__(self, db: Session, vision_service: VisionService, realtime_processor: RealtimeProcessor):
        self.db = db
        self.vision_service = vision_service
        self.realtime_processor = realtime_processor

    # Patient Management
    def get_patient(self, patient_id: int) -> Optional[Patient]:
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_patients(self, site_id: Optional[int] = None) -> List[Patient]:
        query = self.db.query(Patient)
        if site_id:
            query = query.filter(Patient.site_id == site_id)
        return query.all()

    def create_patient(self, patient_data: Dict) -> Patient:
        patient = Patient(**patient_data)
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    def update_patient(self, patient_id: int, patient_data: Dict) -> Optional[Patient]:
        patient = self.get_patient(patient_id)
        if patient:
            for key, value in patient_data.items():
                setattr(patient, key, value)
            self.db.commit()
            self.db.refresh(patient)
        return patient

    # Patient Monitoring
    def record_patient_monitoring(self, patient_id: int, monitoring_data: Dict) -> PatientMonitoringRecord:
        record = PatientMonitoringRecord(
            patient_id=patient_id,
            timestamp=datetime.utcnow(),
            **monitoring_data
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_patient_monitoring_history(
        self, patient_id: int, start_time: datetime, end_time: datetime
    ) -> List[PatientMonitoringRecord]:
        return self.db.query(PatientMonitoringRecord).filter(
            and_(
                PatientMonitoringRecord.patient_id == patient_id,
                PatientMonitoringRecord.timestamp.between(start_time, end_time)
            )
        ).all()

    # Medical Alerts
    def create_alert(self, alert_data: Dict) -> MedicalAlert:
        alert = MedicalAlert(**alert_data)
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_active_alerts(self, site_id: Optional[int] = None) -> List[MedicalAlert]:
        query = self.db.query(MedicalAlert).filter(
            MedicalAlert.status.in_(['active', 'acknowledged'])
        )
        if site_id:
            query = query.join(Patient).filter(Patient.site_id == site_id)
        return query.all()

    def respond_to_alert(self, alert_id: int, response_data: Dict) -> AlertResponse:
        response = AlertResponse(
            alert_id=alert_id,
            response_time=datetime.utcnow(),
            **response_data
        )
        self.db.add(response)
        
        # Update alert status
        alert = self.db.query(MedicalAlert).filter(MedicalAlert.id == alert_id).first()
        if alert:
            alert.status = 'acknowledged'
            
        self.db.commit()
        self.db.refresh(response)
        return response

    # Staff Tracking
    def update_staff_location(self, user_id: int, location_data: Dict) -> StaffLocation:
        staff_location = self.db.query(StaffLocation).filter(
            StaffLocation.user_id == user_id
        ).first()
        
        if staff_location:
            for key, value in location_data.items():
                setattr(staff_location, key, value)
            staff_location.last_updated = datetime.utcnow()
        else:
            staff_location = StaffLocation(
                user_id=user_id,
                last_updated=datetime.utcnow(),
                **location_data
            )
            self.db.add(staff_location)
            
        self.db.commit()
        self.db.refresh(staff_location)
        return staff_location

    def get_staff_locations(self, site_id: Optional[int] = None) -> List[StaffLocation]:
        query = self.db.query(StaffLocation)
        if site_id:
            query = query.filter(StaffLocation.site_id == site_id)
        return query.all()

    # Analytics and Processing
    def process_camera_frame(self, camera_id: int, frame_data: bytes):
        """Process camera frame for patient monitoring and staff tracking"""
        # Use vision service for detection
        detections = self.vision_service.detect_objects(frame_data)
        
        # Process detections in real-time
        processed_data = self.realtime_processor.process_hospital_frame(
            camera_id, detections
        )
        
        # Update patient and staff locations
        for person in processed_data.get('people', []):
            if person['type'] == 'patient':
                self.record_patient_monitoring(
                    person['id'],
                    {
                        'location': person['location'],
                        'status': person['status'],
                        'vital_signs': person.get('vital_signs', {})
                    }
                )
            elif person['type'] == 'staff':
                self.update_staff_location(
                    person['id'],
                    {
                        'location': person['location'],
                        'status': 'active'
                    }
                )
        
        # Process potential alerts
        for alert in processed_data.get('alerts', []):
            self.create_alert(alert)

    def get_hospital_analytics(
        self, site_id: int, start_time: datetime, end_time: datetime
    ) -> Dict:
        """Get analytics data for hospital dashboard"""
        return {
            'patient_stats': self._get_patient_statistics(site_id, start_time, end_time),
            'alert_stats': self._get_alert_statistics(site_id, start_time, end_time),
            'staff_stats': self._get_staff_statistics(site_id, start_time, end_time)
        }

    def _get_patient_statistics(
        self, site_id: int, start_time: datetime, end_time: datetime
    ) -> Dict:
        """Get patient-related statistics"""
        patients = self.db.query(Patient).filter(Patient.site_id == site_id).all()
        monitoring_records = self.db.query(PatientMonitoringRecord).join(Patient).filter(
            and_(
                Patient.site_id == site_id,
                PatientMonitoringRecord.timestamp.between(start_time, end_time)
            )
        ).all()

        return {
            'total_patients': len(patients),
            'status_distribution': self._calculate_status_distribution(patients),
            'monitoring_data': self._process_monitoring_records(monitoring_records)
        }

    def _get_alert_statistics(
        self, site_id: int, start_time: datetime, end_time: datetime
    ) -> Dict:
        """Get alert-related statistics"""
        alerts = self.db.query(MedicalAlert).join(Patient).filter(
            and_(
                Patient.site_id == site_id,
                MedicalAlert.created_at.between(start_time, end_time)
            )
        ).all()

        return {
            'total_alerts': len(alerts),
            'severity_distribution': self._calculate_severity_distribution(alerts),
            'response_times': self._calculate_response_times(alerts)
        }

    def _get_staff_statistics(
        self, site_id: int, start_time: datetime, end_time: datetime
    ) -> Dict:
        """Get staff-related statistics"""
        staff_locations = self.db.query(StaffLocation).filter(
            and_(
                StaffLocation.site_id == site_id,
                StaffLocation.last_updated.between(start_time, end_time)
            )
        ).all()

        return {
            'active_staff': len([sl for sl in staff_locations if sl.status == 'active']),
            'staff_distribution': self._calculate_staff_distribution(staff_locations)
        }
