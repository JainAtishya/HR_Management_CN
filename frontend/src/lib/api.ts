import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('API call to:', `${API_BASE_URL}/auth/login`);
    console.log('With credentials:', credentials);
    return api.post('/auth/login', credentials);
  },
  
  getProfile: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.put('/auth/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Members API
export const membersAPI = {
  getMembers: (params?: any) => api.get('/members', { params }),
  
  getMember: (id: string) => api.get(`/members/${id}`),
  
  createMember: (data: any) => api.post('/members', data),
  
  updateMember: (id: string, data: any) => api.put(`/members/${id}`, data),
  
  deleteMember: (id: string) => api.delete(`/members/${id}`),
  
  getMemberStats: () => api.get('/members/stats/overview'),
};

// Warnings API
export const warningsAPI = {
  getWarnings: (params?: any) => api.get('/warnings', { params }),
  
  getWarning: (id: string) => api.get(`/warnings/${id}`),
  
  createWarning: (data: any) => api.post('/warnings', data),
  
  updateWarning: (id: string, data: any) => api.put(`/warnings/${id}`, data),
  
  resolveWarning: (id: string, data: any) => api.put(`/warnings/${id}/resolve`, data),
  
  deleteWarning: (id: string) => api.delete(`/warnings/${id}`),
  
  getMemberWarnings: (memberId: string, params?: any) => 
    api.get(`/warnings/member/${memberId}`, { params }),
  
  getWarningStats: () => api.get('/warnings/stats/overview'),
};

// Emails API
export const emailsAPI = {
  sendEmail: (data: any) => api.post('/emails/send', data),
  
  getEmailLogs: (params?: any) => api.get('/emails/logs', { params }),
  
  getEmailLog: (id: string) => api.get(`/emails/logs/${id}`),
  
  getTemplates: () => api.get('/emails/templates'),
  
  getEmailStats: (params?: any) => api.get('/emails/stats', { params }),
  
  resendEmail: (id: string) => api.post(`/emails/resend/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardAnalytics: (params?: any) => api.get('/analytics/dashboard', { params }),
  
  getMemberAnalytics: () => api.get('/analytics/members'),
  
  getWarningAnalytics: () => api.get('/analytics/warnings'),
  
  getEmailAnalytics: () => api.get('/analytics/emails'),
  
  exportData: (type: string, format: string) => 
    api.get(`/analytics/export?type=${type}&format=${format}`, {
      responseType: 'blob'
    }),
};

export default api;