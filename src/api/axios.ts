import axios from 'axios';

const API_URL = 'http://localhost:8081/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (error.response.data && error.response.data.message) {
      return Promise.reject(new Error(error.response.data.message));
    }

    if (error.response.data && error.response.data.error) {
      return Promise.reject(new Error(error.response.data.error));
    }

    if (error.response.statusText) {
      return Promise.reject(new Error(error.response.statusText));
    }

    return Promise.reject(error);
  }
);

export default api;