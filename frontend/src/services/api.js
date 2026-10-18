import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const msg = error.response?.data?.detail || error.message || 'Something went wrong';
    return Promise.reject(new Error(msg));
  }
);

export const endpoints = {
  // Analytics
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getCharts: (params) => api.get('/analytics/charts', { params }),

  // Transactions
  getTransactions: (params) => api.get('/transactions', { params }),
  createTransaction: (data) => api.post('/transactions', data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
  clearAllTransactions: () => api.delete('/transactions/clear-all'),
  exportTransactionsUrl: (params) => {
    const query = new URLSearchParams(params).toString();
    return `/api/transactions/export?${query}`;
  },

  // Upload
  previewCSV: (formData) => api.post('/upload/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  processCSV: (formData) => api.post('/upload/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Insights
  getRecurring: () => api.get('/insights/recurring'),
  getAnomalies: () => api.get('/insights/anomalies'),
  getForecast: () => api.get('/insights/forecast'),
  getInsightCards: () => api.get('/insights/cards'),

  // Budgets
  getBudgets: (month) => api.get('/budgets', { params: { month } }),
  saveBudget: (data) => api.post('/budgets', data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),

  // Categories & Rules
  getCategories: () => api.get('/categories'),
  getRules: () => api.get('/rules'),
  createRule: (data) => api.post('/rules', data),
  deleteRule: (id) => api.delete(`/rules/${id}`),

  // Demo Data
  seedDemoData: () => api.post('/demo/seed'),
};

export default api;
