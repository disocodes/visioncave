import axios from 'axios';
import { API_BASE_URL } from '../config';

// Set default base URL from config
axios.defaults.baseURL = API_BASE_URL;

// Set default auth header if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Helper to convert object to form data
const objectToFormData = (obj) => {
  const formData = new URLSearchParams();
  Object.keys(obj).forEach(key => {
    formData.append(key, obj[key]);
  });
  return formData;
};

export const login = async (credentials) => {
  try {
    const formData = objectToFormData({
      ...credentials,
      grant_type: 'password'
    });
    const response = await axios.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const { access_token, token_type } = response.data;
    const fullToken = `${token_type} ${access_token}`;
    
    // Store token
    localStorage.setItem('token', fullToken);
    
    // Set default auth header
    axios.defaults.headers.common['Authorization'] = fullToken;
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
  return axios.get(`/api/v1/users/me`);
};

// Development helper to set token directly
export const setDevToken = async () => {
  try {
    const formData = objectToFormData({
      username: 'test_user',
      password: 'test_password',
      grant_type: 'password'  // Required by OAuth2PasswordRequestForm
    });
    
    const response = await axios.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, token_type } = response.data;
    const fullToken = `${token_type} ${access_token}`;
    
    localStorage.setItem('token', fullToken);
    axios.defaults.headers.common['Authorization'] = fullToken;
  } catch (error) {
    console.error('Failed to get development token:', error);
    throw error;
  }
};

// Axios interceptor for handling token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // For development, get a fresh token
        await setDevToken();
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
