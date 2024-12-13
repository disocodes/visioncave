import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Add error handling wrapper
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    throw error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API No Response:', error.request);
    throw new Error('No response received from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Request Error:', error.message);
    throw error;
  }
};

// Wrap each function with error handling
const wrapWithErrorHandler = (fn) => async (...args) => {
  try {
    const response = await fn(...args);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSecurityStatus = wrapWithErrorHandler((siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/security-status`);
});

export const getOccupancyData = wrapWithErrorHandler((siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/occupancy`);
});

export const getOccupancyHistory = wrapWithErrorHandler((siteId, params) => {
  return axios.get(`${API_URL}/residential/${siteId}/occupancy/history`, { params });
});

export const getPackageDetections = wrapWithErrorHandler((siteId) => {
  return axios.get(`${API_URL}/residential/${siteId}/packages`);
});

export const acknowledgePackage = wrapWithErrorHandler((siteId, packageId) => {
  return axios.post(`${API_URL}/residential/${siteId}/packages/${packageId}/acknowledge`);
});

export const getSecurityEvents = wrapWithErrorHandler((siteId, params) => {
  return axios.get(`${API_URL}/residential/${siteId}/events`, { params });
});

export const acknowledgeSecurityEvent = wrapWithErrorHandler((siteId, eventId) => {
  return axios.post(`${API_URL}/residential/${siteId}/events/${eventId}/acknowledge`);
});
