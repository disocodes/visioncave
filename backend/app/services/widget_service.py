from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..models.sql_models import Widget, WidgetMetric, WidgetAlert
from ..schemas.widget import (
    WidgetCreate, 
    WidgetUpdate, 
    WidgetPositionUpdate,
    MetricCreate,
    AlertCreate
)

class WidgetService:
    async def create_widget(self, db: Session, widget: WidgetCreate) -> Widget:
        # Get the highest order value for the site
        highest_order = db.query(Widget.order)\
            .filter(Widget.site_id == widget.site_id)\
            .order_by(desc(Widget.order))\
            .first()
        
        new_order = (highest_order[0] + 1) if highest_order else 1

        db_widget = Widget(
            name=widget.name,
            type=widget.type,
            config=widget.config,
            description=widget.description,
            position=widget.position,
            module=widget.module,
            status=widget.status,
            site_id=widget.site_id,
            owner_id=widget.owner_id,
            order=new_order,
            created_at=datetime.utcnow()
        )
        db.add(db_widget)
        db.commit()
        db.refresh(db_widget)
        return db_widget

    async def get_widget(
        self, 
        db: Session, 
        widget_id: int, 
        user_id: int
    ) -> Optional[Widget]:
        return db.query(Widget).filter(
            Widget.id == widget_id,
            Widget.owner_id == user_id
        ).first()

    async def get_widgets(
        self, 
        db: Session, 
        user_id: int, 
        site_id: Optional[int] = None,
        module: Optional[str] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Widget]:
        query = db.query(Widget).filter(Widget.owner_id == user_id)
        
        if site_id:
            query = query.filter(Widget.site_id == site_id)
        
        if module:
            query = query.filter(Widget.module == module)
            
        return query.order_by(Widget.order).offset(skip).limit(limit).all()

    async def update_widget(
        self, 
        db: Session, 
        widget_id: int, 
        widget: WidgetUpdate, 
        user_id: int
    ) -> Optional[Widget]:
        db_widget = await self.get_widget(db, widget_id, user_id)
        if db_widget:
            update_data = widget.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_widget, field, value)
            db_widget.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_widget)
        return db_widget

    async def update_widget_position(
        self,
        db: Session,
        widget_id: int,
        position_update: WidgetPositionUpdate,
        user_id: int
    ) -> Optional[Widget]:
        db_widget = await self.get_widget(db, widget_id, user_id)
        if db_widget:
            db_widget.position = position_update.position
            db_widget.order = position_update.order
            db_widget.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(db_widget)
        return db_widget

    async def reorder_widgets(
        self,
        db: Session,
        site_id: int,
        widget_orders: Dict[int, float]
    ) -> List[Widget]:
        widgets = []
        for widget_id, order in widget_orders.items():
            widget = db.query(Widget).filter(
                Widget.id == widget_id,
                Widget.site_id == site_id
            ).first()
            if widget:
                widget.order = order
                widgets.append(widget)
        
        db.commit()
        return widgets

    async def add_metric(
        self,
        db: Session,
        metric: MetricCreate
    ) -> WidgetMetric:
        db_metric = WidgetMetric(**metric.dict())
        db.add(db_metric)
        db.commit()
        db.refresh(db_metric)
        return db_metric

    async def add_alert(
        self,
        db: Session,
        alert: AlertCreate
    ) -> WidgetAlert:
        db_alert = WidgetAlert(**alert.dict())
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        return db_alert

    async def get_widget_summary(
        self,
        db: Session,
        widget_id: int,
        user_id: int
    ) -> Optional[Dict[str, Any]]:
        widget = await self.get_widget(db, widget_id, user_id)
        if not widget:
            return None

        metrics = db.query(WidgetMetric)\
            .filter(WidgetMetric.widget_id == widget_id)\
            .order_by(desc(WidgetMetric.created_at))\
            .limit(5)\
            .all()

        alerts = db.query(WidgetAlert)\
            .filter(
                WidgetAlert.widget_id == widget_id,
                WidgetAlert.status == 'active'
            )\
            .order_by(desc(WidgetAlert.created_at))\
            .limit(5)\
            .all()

        return {
            "metrics": metrics,
            "alerts": alerts
        }

    async def delete_widget(
        self,
        db: Session,
        widget_id: int,
        user_id: int
    ) -> bool:
        db_widget = await self.get_widget(db, widget_id, user_id)
        if db_widget:
            # Delete associated metrics and alerts
            db.query(WidgetMetric)\
                .filter(WidgetMetric.widget_id == widget_id)\
                .delete()
            db.query(WidgetAlert)\
                .filter(WidgetAlert.widget_id == widget_id)\
                .delete()
            
            db.delete(db_widget)
            db.commit()
            return True
        return False

    async def update_widget_data(
        self,
        db: Session,
        widget_id: int,
        user_id: int
    ) -> Optional[Widget]:
        db_widget = await self.get_widget(db, widget_id, user_id)
        if db_widget:
            db_widget.last_data_update = datetime.utcnow()
            db.commit()
            db.refresh(db_widget)
        return db_widget
