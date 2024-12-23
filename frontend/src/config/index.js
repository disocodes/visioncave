// API Configuration
const isCodespace = window.location.hostname.includes('github.dev');
const backendHost = isCodespace ? window.location.hostname.replace('3000', '8000') : 'localhost:8000';
const protocol = isCodespace ? 'https' : 'http';

export const API_BASE_URL = process.env.REACT_APP_API_URL || `${protocol}://${backendHost}`;

// WebSocket Configuration
const wsProtocol = isCodespace ? 'wss' : 'ws';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || `${wsProtocol}://${backendHost}/ws`;

// Other configurations
export const APP_CONFIG = {
    defaultPageSize: 10,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    supportedVideoFormats: ['.mp4', '.avi', '.mov'],
    supportedImageFormats: ['.jpg', '.jpeg', '.png'],
};
