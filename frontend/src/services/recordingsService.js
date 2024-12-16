import axios from 'axios';
import { API_BASE_URL } from '../config';

// Create axios instance for token requests
const tokenApi = axios.create({
  baseURL: API_BASE_URL,
});

// Create axios instance with default config for API requests
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
});

// Function to get auth token
const getAuthToken = async () => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', 'test_user');  // Development credentials
    formData.append('password', 'test_password');

    const response = await tokenApi.post('/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return `${response.data.token_type} ${response.data.access_token}`;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('Authentication failed. Please try again later.');
  }
};

class RecordingsService {
  async getRecordings() {
    try {
      const token = await getAuthToken();
      const response = await api.get('/recordings', {
        headers: {
          'Authorization': token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recordings:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to fetch recordings. Please try again later.');
    }
  }

  async getRecording(id) {
    try {
      const token = await getAuthToken();
      const response = await api.get(`/recordings/${id}`, {
        headers: {
          'Authorization': token
        },
        responseType: 'blob'  // Important for video streaming
      });
      
      // Check if response is empty
      if (response.data.size === 0) {
        throw new Error('No recording content available. Please record a video first.');
      }
      
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching recording:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        // Pass through the backend's detailed error message if available
        throw new Error(error.response.data?.detail || 'No recording content available. Please record a video first.');
      }
      // If it's our own error message about empty content, pass it through
      if (error.message.includes('No recording content available')) {
        throw error;
      }
      throw new Error('Failed to fetch recording. Please try again later.');
    }
  }

  async deleteRecording(id) {
    try {
      const token = await getAuthToken();
      const response = await api.delete(`/recordings/${id}`, {
        headers: {
          'Authorization': token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting recording:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Recording not found.');
      }
      throw new Error('Failed to delete recording. Please try again later.');
    }
  }

  async updateSettings(settings) {
    try {
      const token = await getAuthToken();
      const response = await api.post('/recordings/settings', settings, {
        headers: {
          'Authorization': token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      throw new Error('Failed to update settings. Please try again later.');
    }
  }

  async getRecordingTasks(id) {
    try {
      const token = await getAuthToken();
      const response = await api.get(`/recordings/${id}/tasks`, {
        headers: {
          'Authorization': token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recording tasks:', error);
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('Recording not found.');
      }
      throw new Error('Failed to fetch recording tasks. Please try again later.');
    }
  }
}

export default new RecordingsService();
