import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Base API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://expense-tracker-api.kundanprojects.space/api'  // Production API URL
  : 'http://localhost:8080/api';  // In development, use direct localhost

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Get token from store
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log('🔥 API - Added auth header for:', config.url); // Reduced verbosity
    } else {
      console.log('🔥 API - No token available for:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('🔥 API - Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors intelligently
api.interceptors.response.use(
  (response) => {
    // console.log('🔥 API - Success:', response.config.url, response.status); // Reduced verbosity
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('🔥 API - Error:', url, status);
    console.error('🔥 API - Error details:', error.response?.data);
    
    // Handle 400 - Bad Request (validation errors) - don't logout!
    if (status === 400) {
      console.log('🔥 API - 400 Bad Request (validation error), not logging out');
      return Promise.reject(error);
    }
    
    // Handle 401 - unauthorized with more intelligence
    if (status === 401) {
      console.warn('🔥 API - 401 Unauthorized detected for:', url);
      
      // Check if this is a valid auth endpoint (login/register should not trigger logout)
      const isAuthEndpoint = url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        console.log('🔥 API - 401 on auth endpoint, not clearing session');
        return Promise.reject(error);
      }
      
      // Check if this is a missing endpoint (likely server-side implementation missing)
      const possiblyMissingEndpoints = ['/budgets'];
      const isPossiblyMissing = possiblyMissingEndpoints.some(endpoint => 
        url?.includes(endpoint)
      );
      
      if (isPossiblyMissing) {
        // Silently handle missing endpoints to reduce console noise
        return Promise.reject(error);
      }
      
      // For protected endpoints, check if we have valid token
      const currentToken = useAuthStore.getState().token;
      if (!currentToken) {
        console.log('🔥 API - No token available, error expected');
        return Promise.reject(error);
      }
      
      console.warn('🔥 API - 401 with valid token on critical endpoint, token may be expired');
      console.log('🔥 API - Clearing auth state and redirecting to login');
      
      // Clear auth state using the store method
      useAuthStore.getState().logout();
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (!['/login', '/signup', '/landing', '/'].includes(currentPath)) {
        // Small delay to ensure logout state is processed
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Handle 404 - Not Found (missing endpoints)
    if (status === 404) {
      const missingEndpoints = ['/budgets'];
      const isMissingEndpoint = missingEndpoints.some(endpoint => 
        url?.includes(endpoint)
      );
      
      if (isMissingEndpoint) {
        console.warn('🔥 API - 404 on missing endpoint:', url);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;