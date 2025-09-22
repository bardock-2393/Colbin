import axios from 'axios';

// Determine API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (deployed)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production: use the same host as frontend but port 3001
    return `http://${window.location.hostname}:3001/api`;
  }
  
  // Use environment variable or fallback to localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('API Configuration:', {
  hostname: window.location.hostname,
  port: window.location.port,
  API_BASE_URL: API_BASE_URL,
  REACT_APP_API_URL: process.env.REACT_APP_API_URL
});

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Token management
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
          setTokens(accessToken, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Registering user with API:', API_BASE_URL);
      console.log('User data:', userData);
      
      const response = await api.post('/auth/register', userData);
      
      console.log('Registration response:', response.data);
      
      if (response.data.tokens) {
        setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('Logging in user with API:', API_BASE_URL);
      console.log('Credentials:', { email: credentials.email, password: '[HIDDEN]' });
      
      const response = await api.post('/auth/login', credentials);
      
      console.log('Login response:', response.data);
      
      if (response.data.tokens) {
        setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL
      });
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = getRefreshToken();
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearTokens();
    }
  },

  refreshToken: async () => {
    const refreshToken = getRefreshToken();
    const response = await api.post('/auth/refresh', { refreshToken });
    setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
    return response.data;
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/user/account');
    clearTokens();
    return response.data;
  }
};

// Utility functions
export const isAuthenticated = () => {
  return !!getAccessToken();
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export { clearTokens };
export default api;
