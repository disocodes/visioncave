from fastapi import APIRouter, Depends, HTTPException, WebSocket, status
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from ....models.sql_models import Widget
from ....schemas.widget import (
    WidgetCreate,
    WidgetUpdate,
    WidgetResponse,
    WidgetPositionUpdate,
    WidgetSummary,
    MetricCreate,
    AlertCreate,
    MetricResponse,
    AlertResponse
)
from ....core.deps import get_db, get_current_user
from ....services.widget_service import WidgetService
from ....services.websocket_service import WebSocketService

router = APIRouter()
widget_service = WidgetService()
websocket_service = WebSocketService()

@router.post("/", response_model=WidgetResponse)
async def create_widget(
    widget: WidgetCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    widget.owner_id = current_user.id
    return await widget_service.create_widget(db, widget)

@router.get("/", response_model=List[WidgetResponse])
async def list_widgets(
    site_id: Optional[int] = None,
    module: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await widget_service.get_widgets(
        db, 
        current_user.id, 
        site_id=site_id,
        module=module, 
        skip=skip, 
        limit=limit
    )

@router.get("/{widget_id}", response_model=WidgetResponse)
async def get_widget(
    widget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    widget = await widget_service.get_widget(db, widget_id, current_user.id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return widget

@router.put("/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: int,
    widget: WidgetUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_widget = await widget_service.update_widget(db, widget_id, widget, current_user.id)
    if not updated_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    # Notify connected clients about the update
    await websocket_service.broadcast_to_site(
        updated_widget.site_id,
        {
            "type": "widget_update",
            "widget_id": widget_id,
            "data": WidgetResponse.from_orm(updated_widget).dict()
        }
    )
    
    return updated_widget

@router.put("/{widget_id}/position", response_model=WidgetResponse)
async def update_widget_position(
    widget_id: int,
    position: WidgetPositionUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_widget = await widget_service.update_widget_position(
        db, widget_id, position, current_user.id
    )
    if not updated_widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return updated_widget

@router.post("/reorder")
async def reorder_widgets(
    site_id: int,
    widget_orders: Dict[int, float],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    widgets = await widget_service.reorder_widgets(db, site_id, widget_orders)
    return {"message": "Widgets reordered successfully"}

@router.get("/{widget_id}/summary", response_model=WidgetSummary)
async def get_widget_summary(
    widget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = await widget_service.get_widget_summary(db, widget_id, current_user.id)
    if not summary:
        raise HTTPException(status_code=404, detail="Widget not found")
    return summary

@router.post("/{widget_id}/metrics", response_model=MetricResponse)
async def add_widget_metric(
    widget_id: int,
    metric: MetricCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify widget ownership
    widget = await widget_service.get_widget(db, widget_id, current_user.id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    metric.widget_id = widget_id
    return await widget_service.add_metric(db, metric)

@router.post("/{widget_id}/alerts", response_model=AlertResponse)
async def add_widget_alert(
    widget_id: int,
    alert: AlertCreate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify widget ownership
    widget = await widget_service.get_widget(db, widget_id, current_user.id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    alert.widget_id = widget_id
    db_alert = await widget_service.add_alert(db, alert)
    
    # Notify connected clients about the new alert
    await websocket_service.broadcast_to_site(
        widget.site_id,
        {
            "type": "widget_alert",
            "widget_id": widget_id,
            "alert": AlertResponse.from_orm(db_alert).dict()
        }
    )
    
    return db_alert

@router.delete("/{widget_id}")
async def delete_widget(
    widget_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    widget = await widget_service.get_widget(db, widget_id, current_user.id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    
    site_id = widget.site_id
    success = await widget_service.delete_widget(db, widget_id, current_user.id)
    
    if success:
        # Notify connected clients about the deletion
        await websocket_service.broadcast_to_site(
            site_id,
            {
                "type": "widget_delete",
                "widget_id": widget_id
            }
        )
        return {"message": "Widget deleted successfully"}
    
    raise HTTPException(status_code=500, detail="Failed to delete widget")

@router.websocket("/ws/{site_id}")
async def widget_websocket(
    websocket: WebSocket,
    site_id: int,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    await websocket_service.connect(websocket, site_id)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle real-time widget updates
            if data["type"] == "widget_update":
                widget_id = data["widget_id"]
                widget = await widget_service.get_widget(db, widget_id, current_user.id)
                if widget and widget.site_id == site_id:
                    # Broadcast update to all connected clients
                    await websocket_service.broadcast_to_site(
                        site_id,
                        {
                            "type": "widget_update",
                            "widget_id": widget_id,
                            "data": data["data"]
                        }
                    )
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket_service.disconnect(websocket, site_id)
