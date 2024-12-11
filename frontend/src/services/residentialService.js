import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getSecurityStatus = (siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/security-status`);
};

export const getOccupancyData = (siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/occupancy`);
};

export const getOccupancyHistory = (siteId, params) => {
  return axios.get(`${API_URL}/residential/${siteId}/occupancy/history`, { params });
};

export const getPackageDetections = (siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/packages`);
};

export const acknowledgePackage = (siteId, packageId) => {
  return axios.post(`${API_URL}/residential/${siteId}/packages/${packageId}/acknowledge`);
};

export const getSecurityEvents = (siteId, params) => {
  return axios.get(`${API_URL}/residential/${siteId}/events`, { params });
};

export const acknowledgeSecurityEvent = (siteId, eventId) => {
  return axios.post(`${API_URL}/residential/${siteId}/events/${eventId}/acknowledge`);
};
