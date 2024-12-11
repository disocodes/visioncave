import { useState, useEffect } from 'react';

export const useWebSocket = (url) => {
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setWs(new WebSocket(url));
      }, 5000);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [url]);

  return ws;
};
