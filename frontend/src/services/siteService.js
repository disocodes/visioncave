import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Error handling helper
const handleApiError = (error) => {
  if (error.response) {
    console.error('API Error Response:', error.response.data);
    throw error.response.data;
  } else if (error.request) {
    console.error('API No Response:', error.request);
    throw new Error('No response received from server');
  } else {
    console.error('API Request Error:', error.message);
    throw error;
  }
};

// API request wrapper with error handling
const apiRequest = async (method, url, data = null) => {
  try {
    const response = await method(url, data);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getSites = () => {
  return apiRequest(axios.get, `${API_URL}/sites`);
};

export const getSite = (id) => {
  return apiRequest(axios.get, `${API_URL}/sites/${id}`);
};

export const createSite = (siteData) => {
  return apiRequest(axios.post, `${API_URL}/sites`, siteData);
};

export const updateSite = (id, siteData) => {
  return apiRequest(axios.put, `${API_URL}/sites/${id}`, siteData);
};

export const deleteSite = (id) => {
  return apiRequest(axios.delete, `${API_URL}/sites/${id}`);
};

export const getSiteCameras = (siteId) => {
  return apiRequest(axios.get, `${API_URL}/sites/${siteId}/cameras`);
};

export const getSiteZones = (siteId) => {
  return apiRequest(axios.get, `${API_URL}/sites/${siteId}/zones`);
};

export const addCameraToSite = (siteId, cameraData) => {
  return apiRequest(axios.post, `${API_URL}/sites/${siteId}/cameras`, cameraData);
};

export const removeCameraFromSite = (siteId, cameraId) => {
  return apiRequest(axios.delete, `${API_URL}/sites/${siteId}/cameras/${cameraId}`);
};

// Additional helper methods
export const getSiteAnalytics = (siteId, params) => {
  return apiRequest(axios.get, `${API_URL}/sites/${siteId}/analytics`, { params });
};

export const getSiteStatus = (siteId) => {
  return apiRequest(axios.get, `${API_URL}/sites/${siteId}/status`);
};

export const updateSiteConfiguration = (siteId, config) => {
  return apiRequest(axios.put, `${API_URL}/sites/${siteId}/configuration`, config);
};
