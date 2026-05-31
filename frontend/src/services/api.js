import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('prepwise_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('prepwise_token');
      localStorage.removeItem('prepwise_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login: data => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: data => api.put('/auth/update-profile', data),
  changePassword: data => api.put('/auth/change-password', data),
};

// Resume
export const resumeAPI = {
  analyze: (formData) => api.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/resume/history'),
};

// Interview
export const interviewAPI = {
  start: data => api.post('/interview/start', data),
  submitAnswer: (id, data) => api.post(`/interview/${id}/answer`, data),
  complete: (id, data) => api.post(`/interview/${id}/complete`, data),
  getHistory: () => api.get('/interview/history'),
  getById: id => api.get(`/interview/${id}`),
};

// DSA
export const dsaAPI = {
  log: data => api.post('/dsa/log', data),
  getProblems: params => api.get('/dsa/problems', { params }),
  getAnalytics: () => api.get('/dsa/analytics'),
  delete: id => api.delete(`/dsa/${id}`),
};

// Questions
export const questionsAPI = {
  generate: data => api.post('/questions/generate', data),
};

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: params => api.get('/admin/users', { params }),
  toggleUser: id => api.put(`/admin/users/${id}/toggle`),
};

export default api;
