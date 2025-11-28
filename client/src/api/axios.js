import axios from 'axios';

// Base API configuration - use relative path for K8s/Docker compatibility
// Vite dev server will proxy /api to localhost:8080
// In production (nginx), /api is proxied to backend-service
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('🔥 AXIOS REQUEST -', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔥 AXIOS REQUEST - Adding Authorization header:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('🔥 AXIOS REQUEST - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('🔥 AXIOS REQUEST - Interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('🔥 AXIOS RESPONSE - Success:', response.config.url);
    console.log('🔥 AXIOS RESPONSE - Status:', response.status);
    console.log('🔥 AXIOS RESPONSE - Data:', response.data);
    return response;
  },
  (error) => {
    console.error('🔥 AXIOS RESPONSE - Error:', error.response?.status, error.config?.url);
    console.error('🔥 AXIOS RESPONSE - Error data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔥 AXIOS RESPONSE - 401 Unauthorized, clearing auth data');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      const currentPath = window.location.pathname;
      if (!['/login', '/signup', '/'].includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;