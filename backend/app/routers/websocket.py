from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.realtime_service import manager
import json
import logging
import asyncio
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

# Store connected package detection clients
package_detection_clients = {}

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await manager.process_message(message, client_id)
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from client {client_id}")
            except Exception as e:
                logger.error(f"Error processing message from client {client_id}: {str(e)}")
                
    except WebSocketDisconnect:
        await manager.disconnect(websocket, client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        await manager.disconnect(websocket, client_id)

@router.websocket("/ws/package-detection/{client_id}")
async def package_detection_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    package_detection_clients[client_id] = websocket
    
    try:
        # Send initial connection confirmation
        await websocket.send_json({
            "type": "connection_status",
            "status": "connected",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle client messages if needed
                if message.get("type") == "acknowledge_package":
                    logger.info(f"Package acknowledged by client {client_id}")
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from package detection client {client_id}")
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"Error in package detection websocket: {str(e)}")
                break
                
    finally:
        if client_id in package_detection_clients:
            del package_detection_clients[client_id]
        try:
            await websocket.close()
        except:
            pass

async def broadcast_package_detection(package_data):
    """
    Broadcast package detection event to all connected clients
    """
    disconnected_clients = []
    
    for client_id, websocket in package_detection_clients.items():
        try:
            await websocket.send_json({
                "type": "package_detection",
                "event": "new_package",
                "package_id": package_data["id"],
                "location": package_data.get("location", "Unknown"),
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.error(f"Failed to send to client {client_id}: {str(e)}")
            disconnected_clients.append(client_id)
    
    # Clean up disconnected clients
    for client_id in disconnected_clients:
        if client_id in package_detection_clients:
            del package_detection_clients[client_id]
