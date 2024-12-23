import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance with base URL
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token from localStorage to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

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

export const getSites = async () => {
  try {
    const response = await api.get('/sites');
    return response.data;
  } catch (error) {
    console.error('Failed to get sites:', error);
    throw error;
  }
};

export const getSite = async (id) => {
  try {
    const response = await api.get(`/sites/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get site ${id}:`, error);
    throw error;
  }
};

export const createSite = async (siteData) => {
  try {
    const response = await api.post('/sites', siteData);
    return response.data;
  } catch (error) {
    console.error('Failed to create site:', error);
    throw error;
  }
};

export const updateSite = async (id, siteData) => {
  try {
    const response = await api.put(`/sites/${id}`, siteData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update site ${id}:`, error);
    throw error;
  }
};

export const deleteSite = async (id) => {
  try {
    const response = await api.delete(`/sites/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete site ${id}:`, error);
    throw error;
  }
};

export const getSiteCameras = async (siteId) => {
  try {
    const response = await api.get(`/sites/${siteId}/cameras`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get cameras for site ${siteId}:`, error);
    throw error;
  }
};

export const getSiteZones = async (siteId) => {
  try {
    const response = await api.get(`/sites/${siteId}/zones`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get zones for site ${siteId}:`, error);
    throw error;
  }
};

export const addCameraToSite = async (siteId, cameraData) => {
  try {
    const response = await api.post(`/sites/${siteId}/cameras`, cameraData);
    return response.data;
  } catch (error) {
    console.error(`Failed to add camera to site ${siteId}:`, error);
    throw error;
  }
};

export const removeCameraFromSite = async (siteId, cameraId) => {
  try {
    const response = await api.delete(`/sites/${siteId}/cameras/${cameraId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to remove camera ${cameraId} from site ${siteId}:`, error);
    throw error;
  }
};

export const getSiteAnalytics = async (siteId, params) => {
  try {
    const response = await api.get(`/sites/${siteId}/analytics`, { params });
    return response.data;
  } catch (error) {
    console.error(`Failed to get analytics for site ${siteId}:`, error);
    throw error;
  }
};

export const getSiteStatus = async (siteId) => {
  try {
    const response = await api.get(`/sites/${siteId}/status`);
    return response.data;
  } catch (error) {
    console.error(`Failed to get status for site ${siteId}:`, error);
    throw error;
  }
};

export const updateSiteConfiguration = async (siteId, config) => {
  try {
    const response = await api.put(`/sites/${siteId}/configuration`, config);
    return response.data;
  } catch (error) {
    console.error(`Failed to update configuration for site ${siteId}:`, error);
    throw error;
  }
};
