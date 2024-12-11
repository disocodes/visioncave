import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCameras, getCameraStatus } from '../services/cameraService';

const CameraContext = createContext();

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
};

export const CameraProvider = ({ children }) => {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraStatuses, setCameraStatuses] = useState({});

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(updateCameraStatuses, 5000);
    return () => clearInterval(statusInterval);
  }, [cameras]);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const response = await getCameras();
      setCameras(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCameraStatuses = async () => {
    try {
      const statuses = {};
      await Promise.all(
        cameras.map(async (camera) => {
          const response = await getCameraStatus(camera.id);
          statuses[camera.id] = response.data;
        })
      );
      setCameraStatuses(statuses);
    } catch (err) {
      console.error('Error updating camera statuses:', err);
    }
  };

  const selectCamera = (cameraId) => {
    const camera = cameras.find(c => c.id === cameraId);
    setSelectedCamera(camera);
  };

  const getCameraById = (cameraId) => {
    return cameras.find(c => c.id === cameraId);
  };

  const value = {
    cameras,
    selectedCamera,
    loading,
    error,
    cameraStatuses,
    loadCameras,
    selectCamera,
    getCameraById,
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};
