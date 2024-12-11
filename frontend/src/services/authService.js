import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = (credentials) => {
  return axios.post(`${API_URL}/auth/login`, credentials);
};

export const logout = () => {
  return axios.post(`${API_URL}/auth/logout`);
};

export const register = (userData) => {
  return axios.post(`${API_URL}/auth/register`, userData);
};

export const getCurrentUser = () => {
  return axios.get(`${API_URL}/auth/me`);
};

export const refreshToken = () => {
  return axios.post(`${API_URL}/auth/refresh-token`);
};

export const forgotPassword = (email) => {
  return axios.post(`${API_URL}/auth/forgot-password`, { email });
};

export const resetPassword = (token, newPassword) => {
  return axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
};

export const changePassword = (passwords) => {
  return axios.post(`${API_URL}/auth/change-password`, passwords);
};

// Axios interceptor for handling token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await refreshToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
