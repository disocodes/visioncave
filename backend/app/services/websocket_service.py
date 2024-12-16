from fastapi import WebSocket
from typing import Dict, Set, Any
import json

class WebSocketService:
    def __init__(self):
        # Store active connections by site_id
        self.active_connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, site_id: int):
        await websocket.accept()
        if site_id not in self.active_connections:
            self.active_connections[site_id] = set()
        self.active_connections[site_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, site_id: int):
        if site_id in self.active_connections:
            self.active_connections[site_id].discard(websocket)
            if not self.active_connections[site_id]:
                del self.active_connections[site_id]

    async def broadcast_to_site(self, site_id: int, message: Any):
        if site_id in self.active_connections:
            dead_connections = set()
            for connection in self.active_connections[site_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.add(connection)
            
            # Clean up dead connections
            for dead in dead_connections:
                self.active_connections[site_id].discard(dead)
            if not self.active_connections[site_id]:
                del self.active_connections[site_id]

    async def send_personal_message(self, websocket: WebSocket, message: Any):
        try:
            await websocket.send_json(message)
        except Exception:
            # Handle disconnection
            for site_connections in self.active_connections.values():
                site_connections.discard(websocket)

    def get_site_connections(self, site_id: int) -> Set[WebSocket]:
        return self.active_connections.get(site_id, set())

# Create a global instance
websocket_service = WebSocketService()
