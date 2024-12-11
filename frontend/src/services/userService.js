import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getUsers = () => {
  return axios.get(`${API_URL}/users`);
};

export const getUser = (id) => {
  return axios.get(`${API_URL}/users/${id}`);
};

export const createUser = (userData) => {
  return axios.post(`${API_URL}/users`, userData);
};

export const updateUser = (id, userData) => {
  return axios.put(`${API_URL}/users/${id}`, userData);
};

export const deleteUser = (id) => {
  return axios.delete(`${API_URL}/users/${id}`);
};

export const getUserRoles = (userId) => {
  return axios.get(`${API_URL}/users/${userId}/roles`);
};

export const assignRole = (userId, roleData) => {
  return axios.post(`${API_URL}/users/${userId}/roles`, roleData);
};

export const removeRole = (userId, roleId) => {
  return axios.delete(`${API_URL}/users/${userId}/roles/${roleId}`);
};

export const getUserOrganization = (userId) => {
  return axios.get(`${API_URL}/users/${userId}/organization`);
};
