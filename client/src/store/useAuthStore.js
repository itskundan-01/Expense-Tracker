import { create } from 'zustand';
import { authAPI } from '../api/endpoints';
import { toast } from 'react-toastify';

// Consistent localStorage keys (matching axios interceptor)
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'user';

// Helper functions for localStorage management
const saveAuthData = (token, userData) => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Failed to save auth data:', error);
    return false;
  }
};

const loadAuthData = () => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userDataStr = localStorage.getItem(USER_DATA_KEY);
    
    if (token && userDataStr) {
      const userData = JSON.parse(userDataStr);
      return { token, userData };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load auth data:', error);
    return null;
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear auth data:', error);
    return false;
  }
};

// Clean Zustand auth store
export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  // Initialize auth state from localStorage
  initialize: () => {
    console.log('🔧 Initializing auth store...');
    
    try {
      const authData = loadAuthData();
      
      if (authData?.token && authData?.userData) {
        console.log('✅ Valid auth data found, user authenticated:', authData.userData.email);
        
        // Set state atomically
        set({
          user: authData.userData,
          token: authData.token,
          isAuthenticated: true,
          isLoading: false
        });
        
        console.log('✅ Auth state initialized successfully');
        return true;
      } else {
        console.log('ℹ️ No valid auth data found');
        
        // Clear any partial/invalid data
        clearAuthData();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
        
        return false;
      }
    } catch (error) {
      console.error('❌ Error during auth initialization:', error);
      
      // Clear corrupted data
      clearAuthData();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      return false;
    }
  },

  // Login function
  login: async (credentials) => {
    console.log('🔑 Starting login process...');
    set({ isLoading: true });

    try {
      const response = await authAPI.login(credentials);
      console.log('📨 Login response:', response);

      // Extract JWT token (server returns 'token' field)
      const token = response.token;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Extract user data
      const userData = {
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };

      // Save to localStorage FIRST
      const saved = saveAuthData(token, userData);
      if (!saved) {
        throw new Error('Failed to save authentication data');
      }

      // Update store state in one atomic operation to prevent race conditions
      set({
        user: userData,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ Login successful for:', userData.email);
      console.log('✅ Authentication state updated:', { isAuthenticated: true, user: userData.email });
      
      // Small delay to ensure state is propagated before showing toast
      setTimeout(() => {
        toast.success(`Welcome back, ${userData.firstName}!`);
      }, 100);
      
      return { success: true, user: userData };

    } catch (error) {
      console.error('❌ Login failed:', error);
      
      // Clear any partial state
      clearAuthData();
      
      set({ 
        isLoading: false, 
        isAuthenticated: false,
        user: null,
        token: null 
      });
      
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      
      return { success: false, message };
    }
  },

  // Register function
  register: async (userData) => {
    console.log('📝 Starting registration process...');
    set({ isLoading: true });

    try {
      const response = await authAPI.register(userData);
      console.log('📨 Registration response:', response);

      // Extract JWT token (server returns 'token' field)
      const token = response.token;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Extract user data
      const userInfo = {
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };

      // Save to localStorage
      const saved = saveAuthData(token, userInfo);
      if (!saved) {
        throw new Error('Failed to save authentication data');
      }

      // Update store state
      set({
        user: userInfo,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ Registration successful for:', userInfo.email);
      toast.success(`Welcome ${userInfo.firstName}! Account created successfully.`);
      
      return { success: true, user: userInfo };

    } catch (error) {
      console.error('❌ Registration failed:', error);
      set({ 
        isLoading: false, 
        isAuthenticated: false,
        user: null,
        token: null 
      });
      
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      
      return { success: false, message };
    }
  },

  // Logout function
  logout: () => {
    console.log('🚪 Logging out...');
    
    // Clear localStorage
    clearAuthData();
    
    // Reset store state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });

    toast.info('You have been logged out');
    console.log('✅ Logout completed');
  },

  // Validate current authentication
  validateAuth: async () => {
    const state = get();
    if (!state.token) {
      console.log('🔍 No token to validate');
      return false;
    }

    try {
      console.log('🔍 Validating token with server...');
      await authAPI.validateToken();
      console.log('✅ Token validation successful');
      return true;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      
      // Only logout if it's actually a 401 error
      if (error.response?.status === 401) {
        console.log('🔍 Token expired/invalid, clearing auth data');
        get().logout();
      } else {
        console.warn('🔍 Token validation failed due to network/server issue, keeping auth state');
      }
      return false;
    }
  },

  // Check if token might be expired (client-side check)
  isTokenExpired: () => {
    const state = get();
    if (!state.token) return true;
    
    try {
      // Basic JWT expiration check (decode without verification)
      const payload = JSON.parse(atob(state.token.split('.')[1]));
      const now = Date.now() / 1000;
      const isExpired = payload.exp && payload.exp < now;
      
      if (isExpired) {
        console.warn('🕒 Token appears to be expired');
      }
      
      return isExpired;
    } catch (error) {
      console.error('🔍 Error checking token expiration:', error);
      return false; // If we can't parse, assume it's valid
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    console.log('👤 Updating user profile...');
    set({ isLoading: true });

    try {
      // TODO: Implement profile update API call when backend is ready
      console.warn('👤 Profile update API not implemented yet, using mock update');
      
      const currentUser = get().user;
      const updatedUser = { ...currentUser, ...profileData };
      
      // Update localStorage and state
      const saved = saveAuthData(get().token, updatedUser);
      if (saved) {
        set({ user: updatedUser, isLoading: false });
        console.log('✅ Profile updated successfully');
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error('Failed to save profile data');
      }
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      set({ isLoading: false });
      toast.error('Failed to update profile');
      return { success: false, message: error.message };
    }
  },

  // Utility getters
  getCurrentUser: () => get().user,
  getCurrentToken: () => get().token,
  isUserAuthenticated: () => {
    const state = get();
    return state.isAuthenticated && !!state.token && !!state.user;
  }
}));