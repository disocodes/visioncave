import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getSites = () => {
  return axios.get(`${API_URL}/sites`);
};

export const getSite = (id) => {
  return axios.get(`${API_URL}/sites/${id}`);
};

export const createSite = (siteData) => {
  return axios.post(`${API_URL}/sites`, siteData);
};

export const updateSite = (id, siteData) => {
  return axios.put(`${API_URL}/sites/${id}`, siteData);
};

export const deleteSite = (id) => {
  return axios.delete(`${API_URL}/sites/${id}`);
};

export const getSiteCameras = (siteId) => {
  return axios.get(`${API_URL}/sites/${siteId}/cameras`);
};

export const getSiteZones = (siteId) => {
  return axios.get(`${API_URL}/sites/${siteId}/zones`);
};

export const addCameraToSite = (siteId, cameraData) => {
  return axios.post(`${API_URL}/sites/${siteId}/cameras`, cameraData);
};

export const removeCameraFromSite = (siteId, cameraId) => {
  return axios.delete(`${API_URL}/sites/${siteId}/cameras/${cameraId}`);
};
