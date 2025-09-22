import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await api.post('/auth/register', userData);
    if (response.data.tokens) {
      setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.tokens) {
      setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
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
