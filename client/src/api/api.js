import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Base API configuration
const API_BASE_URL = 'http://localhost:8080/api';

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
    // Only log errors for critical endpoints, not missing ones
    const missingEndpoints = ['/budgets', '/accounts', '/categories'];
    const isMissingEndpoint = missingEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    if (!isMissingEndpoint) {
      console.error('🔥 API - Error:', error.config?.url, error.response?.status);
      console.error('🔥 API - Error details:', error.response?.data);
    }
    
    // Handle 401 - unauthorized with more intelligence
    if (error.response?.status === 401) {
      console.warn('🔥 API - 401 Unauthorized detected for:', error.config?.url);
      
      // Check if this is a valid auth endpoint (login/register should not trigger logout)
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        console.log('🔥 API - 401 on auth endpoint, not clearing session');
        return Promise.reject(error);
      }
      
      // Check if this is a missing endpoint (likely server-side implementation missing)
      const missingEndpoints = ['/budgets', '/accounts', '/categories'];
      const isMissingEndpoint = missingEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (isMissingEndpoint) {
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
    if (error.response?.status === 404) {
      const missingEndpoints = ['/budgets', '/accounts', '/categories'];
      const isMissingEndpoint = missingEndpoints.some(endpoint => 
        error.config?.url?.includes(endpoint)
      );
      
      if (isMissingEndpoint) {
        console.warn('🔥 API - 404 on missing endpoint:', error.config?.url);
        console.log('🔥 API - This endpoint is not implemented on the server yet');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;