import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Student API
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getByRollNumber: (rollNumber) => api.get(`/students/roll/${rollNumber}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getStats: () => api.get('/students/stats/overview'),
  promote: (data) => api.post('/admin/students/promote', data),
};

// Result API
export const resultAPI = {
  checkResult: (data) => api.post('/results/check', data),
  getAll: (params) => api.get('/results', { params }),
  getById: (id) => api.get(`/results/${id}`),
  create: (data) => api.post('/results', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
  togglePublish: (id) => api.patch(`/results/${id}/publish`),
  getStats: () => api.get('/admin/results/stats'), 
  getMeritList: (params) => api.get('/admin/results/merit-list', { params }),
  getGazette: (params) => api.get('/admin/results/gazette', { params }),
  getActivity: () => api.get('/admin/results/activity'),
};

// Fee Management API
export const feeAPI = {
  createStructure: (data) => api.post('/fees/structure', data),
  deleteStructure: (id, cascade) => api.delete(`/fees/structure/${id}`, { params: { cascade } }),
  getStructures: () => api.get('/fees/structure'),
  assignFees: (data) => api.post('/fees/assign', data),
  getMyDues: () => api.get('/fees/my-dues'),
  getStudentDuesAdmin: (id) => api.get(`/fees/student/${id}`),
  recordPayment: (data) => api.post('/fees/pay', data),
  studentPay: (data) => api.post('/fees/student-pay', data, { headers: { 'Content-Type': undefined } }),
  createExtensionRequest: (data) => api.post('/fees/extension-request', data),
  getExtensionRequests: (params) => api.get('/fees/extension-requests', { params }),
  resolveExtensionRequest: (id, data) => api.put(`/fees/extension-request/${id}`, data),
  getFeeAnalysis: () => api.get('/fees/stats'),
  verifyPayment: (feeId, txnId, data) => api.put(`/fees/verify-payment/${feeId}/${txnId}`, data),
};

export default api;
