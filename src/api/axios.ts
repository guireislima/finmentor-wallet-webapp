import axios from 'axios';
import { getToken, removeToken } from '../utils/auth.ts';

const API_URL = 'http://localhost:8081/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', `${config.baseURL}${config.url}`);
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    console.error('Full error response:', JSON.stringify(error.response, null, 2));
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      request: error.request,
      config: error.config
    });
    
    // If there's no response, it's a network error
    if (!error.response) {
      console.error('Network error - no response received');
      return Promise.reject(new Error('Network error - please check your connection'));
    }
    
    // For 401 errors, we want to pass through the error message from the server
    if (error.response.status === 401) {
      // Try to get the error message from different possible locations
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          error.response.data?.detail || 
                          (typeof error.response.data === 'string' ? error.response.data : 'Unauthorized access');
      console.log('Extracted error message:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    }
    
    return Promise.reject(error);
  }
);

export default api;