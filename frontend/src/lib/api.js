import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Try to refresh token
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refresh_token: refreshToken,
          });
          
          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);
          
          // Retry original request
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/v1/auth/login-json', credentials),
  register: (userData) => api.post('/api/v1/auth/register', userData),
  logout: () => api.post('/api/v1/auth/logout'),
  getCurrentUser: () => api.get('/api/v1/auth/me'),
};

// Projects API
export const projectAPI = {
  getProjects: (params) => api.get('/api/v1/projects/', { params }),
  getProject: (id) => api.get(`/api/v1/projects/${id}`),
  createProject: (data) => api.post('/api/v1/projects/', data),
  updateProject: (id, data) => api.put(`/api/v1/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/api/v1/projects/${id}`),
  getProjectStats: (id) => api.get(`/api/v1/projects/${id}/stats`),
};

// Legacy alias for backward compatibility
export const projectsAPI = projectAPI;

// Tasks API
export const tasksAPI = {
  getAll: (params) => api.get('/api/v1/tasks', { params }),
  getById: (id) => api.get(`/api/v1/tasks/${id}`),
  create: (data) => api.post('/api/v1/tasks', data),
  update: (id, data) => api.put(`/api/v1/tasks/${id}`, data),
  delete: (id) => api.delete(`/api/v1/tasks/${id}`),
  getSteps: (id) => api.get(`/api/v1/tasks/${id}/steps`),
  getFiles: (id) => api.get(`/api/v1/tasks/${id}/files`),
  getLogs: (id) => api.get(`/api/v1/tasks/${id}/logs`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params) => api.get('/api/v1/analytics/dashboard', { params }),
  getTaskPerformance: (params) => api.get('/api/v1/analytics/tasks/performance', { params }),
  getCosts: (params) => api.get('/api/v1/analytics/costs', { params }),
  getUsageTrends: (params) => api.get('/api/v1/analytics/usage-trends', { params }),
};

export default api;

