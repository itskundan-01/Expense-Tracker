import api from './api';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Validate token
  validateToken: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

export const dashboardAPI = {
  // Get dashboard summary
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Get recent transactions
  getRecentTransactions: async (limit = 5) => {
    const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
    return response.data;
  },

  // Get monthly summary
  getMonthlySummary: async (year = new Date().getFullYear()) => {
    const response = await api.get(`/dashboard/monthly-summary?year=${year}`);
    return response.data;
  },
};

export const transactionAPI = {
  // Get all transactions
  getAll: async (page = 0, size = 20) => {
    const response = await api.get(`/transactions?page=${page}&size=${size}`);
    return response.data;
  },

  // Get transaction by ID
  getById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  // Update transaction
  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  // Delete transaction
  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};

export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Create category
  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  // Update category
  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export const budgetsAPI = {
  // Get all budgets
  getAll: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  // Create budget
  create: async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  },

  // Update budget
  update: async (id, budgetData) => {
    const response = await api.put(`/budgets/${id}`, budgetData);
    return response.data;
  },

  // Delete budget
  delete: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  },
};

export const accountsAPI = {
  // Get all accounts
  getAll: async () => {
    const response = await api.get('/accounts');
    return response.data;
  },

  // Create account
  create: async (accountData) => {
    const response = await api.post('/accounts', accountData);
    return response.data;
  },

  // Update account
  update: async (id, accountData) => {
    const response = await api.put(`/accounts/${id}`, accountData);
    return response.data;
  },

  // Delete account
  delete: async (id) => {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  },
};

export const healthAPI = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Default export with all API endpoints
const api_endpoints = {
  auth: authAPI,
  dashboard: dashboardAPI,
  transactions: transactionAPI,  // Fixed: was transactionsAPI
  categories: categoriesAPI,
  budgets: budgetsAPI,
  accounts: accountsAPI,
  health: healthAPI,
};

export default api_endpoints;