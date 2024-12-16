// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

// WebSocket Configuration
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8001/ws';

// Other configurations
export const APP_CONFIG = {
    defaultPageSize: 10,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedVideoFormats: ['.mp4', '.avi', '.mov'],
    supportedImageFormats: ['.jpg', '.jpeg', '.png'],
};
