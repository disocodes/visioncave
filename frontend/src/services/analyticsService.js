import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getAnalytics = (params) => {
  return axios.get(`${API_URL}/analytics`, { params });
};

export const getAnalyticsByCamera = (cameraId, params) => {
  return axios.get(`${API_URL}/analytics/camera/${cameraId}`, { params });
};

export const getAnalyticsBySite = (siteId, params) => {
  return axios.get(`${API_URL}/analytics/site/${siteId}`, { params });
};

export const getAnalyticsByZone = (zoneId, params) => {
  return axios.get(`${API_URL}/analytics/zone/${zoneId}`, { params });
};

export const getAnalyticsReport = (params) => {
  return axios.get(`${API_URL}/analytics/report`, { params });
};

export const exportAnalytics = (params) => {
  return axios.get(`${API_URL}/analytics/export`, {
    params,
    responseType: 'blob',
  });
};

export const getDetectionEvents = (params) => {
  return axios.get(`${API_URL}/analytics/events`, { params });
};

export const getEventDetails = (eventId) => {
  return axios.get(`${API_URL}/analytics/events/${eventId}`);
};

export const acknowledgeEvent = (eventId, acknowledgementData) => {
  return axios.post(`${API_URL}/analytics/events/${eventId}/acknowledge`, acknowledgementData);
};

export const getAnalyticsSettings = () => {
  return axios.get(`${API_URL}/analytics/settings`);
};

export const updateAnalyticsSettings = (settings) => {
  return axios.put(`${API_URL}/analytics/settings`, settings);
};

export const getDetectionModels = () => {
  return axios.get(`${API_URL}/analytics/models`);
};

export const updateDetectionModel = (modelId, modelData) => {
  return axios.put(`${API_URL}/analytics/models/${modelId}`, modelData);
};

export const trainModel = (modelId, trainingData) => {
  return axios.post(`${API_URL}/analytics/models/${modelId}/train`, trainingData);
};

export const getModelStatus = (modelId) => {
  return axios.get(`${API_URL}/analytics/models/${modelId}/status`);
};
