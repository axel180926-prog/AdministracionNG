import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      console.log('Token inválido, redirigir a login');
    }

    if (error.response?.status === 403) {
      console.log('Acceso denegado');
    }

    return Promise.reject(error);
  }
);

// Servicios específicos
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, businessName: string) =>
    api.post('/auth/register', { email, password, businessName }),
};

export const productsService = {
  getProducts: (page = 1, limit = 10, search = '', category = '') =>
    api.get('/products', { params: { page, limit, search, category } }),
  getProductById: (id: number) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post('/products', data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),
};

export const salesService = {
  getSales: (page = 1, limit = 10, dateFrom = '', dateTo = '') =>
    api.get('/sales', { params: { page, limit, dateFrom, dateTo } }),
  getSaleById: (id: number) => api.get(`/sales/${id}`),
  createSale: (data: any) => api.post('/sales', data),
  updateSaleStatus: (id: number, status: string) =>
    api.put(`/sales/${id}/status`, { status }),
  getSalesReport: (dateFrom: string, dateTo: string) =>
    api.get('/sales/report', { params: { dateFrom, dateTo } }),
};

export const inventoryService = {
  getInventory: (page = 1, limit = 10, lowStockOnly = false) =>
    api.get('/inventory', { params: { page, limit, lowStockOnly } }),
  addStock: (productId: number, quantity: number, notes = '') =>
    api.post('/inventory/add', { productId, quantity, notes }),
  removeStock: (productId: number, quantity: number, reason = '') =>
    api.post('/inventory/remove', { productId, quantity, reason }),
  getHistory: (page = 1, limit = 10, productId = undefined) =>
    api.get('/inventory/history', { params: { page, limit, productId } }),
  getLowStock: () => api.get('/inventory/low-stock'),
  getSummary: () => api.get('/inventory/summary'),
};

export const reportsService = {
  getSalesReport: (dateFrom: string, dateTo: string) =>
    api.get('/reports/sales', { params: { dateFrom, dateTo } }),
  getSalesByCategory: (dateFrom: string, dateTo: string) =>
    api.get('/reports/sales-by-category', { params: { dateFrom, dateTo } }),
  getTopProducts: (dateFrom: string, dateTo: string, limit = 10) =>
    api.get('/reports/top-products', { params: { dateFrom, dateTo, limit } }),
  getInventoryReport: () => api.get('/reports/inventory'),
  getLowStockReport: () => api.get('/reports/low-stock'),
  getInventoryMovements: (dateFrom: string, dateTo: string) =>
    api.get('/reports/movements', { params: { dateFrom, dateTo } }),
  getDashboard: () => api.get('/reports/dashboard'),
  getDailyReport: (date: string) => api.get('/reports/daily', { params: { date } }),
  getSalesByPaymentMethod: (dateFrom: string, dateTo: string) =>
    api.get('/reports/payment-methods', { params: { dateFrom, dateTo } }),
};

export const configService = {
  getConfig: () => api.get('/config'),
  updateConfig: (data: any) => api.put('/config', data),
  getModules: () => api.get('/config/modules'),
  getAvailableModules: () => api.get('/config/modules/available'),
  toggleModule: (moduleId: number, isActive: boolean) =>
    api.post('/config/modules/toggle', { moduleId, isActive }),
  getBusinessInfo: () => api.get('/config/business'),
  updateBusinessInfo: (data: any) => api.put('/config/business', data),
};
