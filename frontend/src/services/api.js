import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Owner API
export const ownerAPI = {
  getAll: () => api.get('/owners'),
  getById: (id) => api.get(`/owners/${id}`),
  create: (data) => api.post('/owners', data),
  update: (id, data) => api.put(`/owners/${id}`, data),
  delete: (id) => api.delete(`/owners/${id}`),
};

// Vehicle API
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// License API
export const licenseAPI = {
  getAll: () => api.get('/licenses'),
  getById: (id) => api.get(`/licenses/${id}`),
  create: (data) => api.post('/licenses', data),
  update: (id, data) => api.put(`/licenses/${id}`, data),
  delete: (id) => api.delete(`/licenses/${id}`),
};

// Violation API
export const violationAPI = {
  getAll: () => api.get('/violations'),
  getById: (id) => api.get(`/violations/${id}`),
  create: (data) => api.post('/violations', data),
  update: (id, data) => api.put(`/violations/${id}`, data),
  delete: (id) => api.delete(`/violations/${id}`),
};

// Violation Type API
export const violationTypeAPI = {
  getAll: () => api.get('/violation-types'),
  getById: (id) => api.get(`/violation-types/${id}`),
};

// Payment API
export const paymentAPI = {
  getAll: () => api.get('/payments'),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

// Suspension API
export const suspensionAPI = {
  getAll: () => api.get('/suspensions'),
  getById: (id) => api.get(`/suspensions/${id}`),
  create: (data) => api.post('/suspensions', data),
  update: (id, data) => api.put(`/suspensions/${id}`, data),
  delete: (id) => api.delete(`/suspensions/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
