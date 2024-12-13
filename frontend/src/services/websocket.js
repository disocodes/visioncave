class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 3000;
  }

  connect(url = `ws://${window.location.hostname}:8000/api/v1/ws`) {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('WebSocket Connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { type, payload } = data;
            
            if (this.subscribers.has(type)) {
              this.subscribers.get(type).forEach(callback => callback(payload));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket Disconnected');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket Error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('WebSocket Connection Error:', error);
        reject(error);
      }
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectTimeout);
    }
  }

  subscribe(type, callback) {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type).add(callback);

    return () => {
      const callbacks = this.subscribers.get(type);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(type);
        }
      }
    };
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, payload }));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService();
export default wsService;
