import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const getCameras = () => {
  return axios.get(`${API_URL}/cameras`);
};

export const getCamera = (id) => {
  return axios.get(`${API_URL}/cameras/${id}`);
};

export const createCamera = (cameraData) => {
  return axios.post(`${API_URL}/cameras`, cameraData);
};

export const updateCamera = (id, cameraData) => {
  return axios.put(`${API_URL}/cameras/${id}`, cameraData);
};

export const deleteCamera = (id) => {
  return axios.delete(`${API_URL}/cameras/${id}`);
};

export const getCameraStream = (id) => {
  return axios.get(`${API_URL}/cameras/${id}/stream`);
};

export const startCameraStream = (id) => {
  return axios.post(`${API_URL}/cameras/${id}/stream/start`);
};

export const stopCameraStream = (id) => {
  return axios.post(`${API_URL}/cameras/${id}/stream/stop`);
};

export const getCameraConfig = (id) => {
  return axios.get(`${API_URL}/cameras/${id}/config`);
};

export const updateCameraConfig = (id, config) => {
  return axios.put(`${API_URL}/cameras/${id}/config`, config);
};

export const getCameraStatus = (id) => {
  return axios.get(`${API_URL}/cameras/${id}/status`);
};

export const getCameraAnalytics = (id, params) => {
  return axios.get(`${API_URL}/cameras/${id}/analytics`, { params });
};

export const getCameraRecordings = (id, params) => {
  return axios.get(`${API_URL}/cameras/${id}/recordings`, { params });
};

export const startRecording = (id) => {
  return axios.post(`${API_URL}/cameras/${id}/recordings/start`);
};

export const stopRecording = (id) => {
  return axios.post(`${API_URL}/cameras/${id}/recordings/stop`);
};
