import api from './api';

export const dashboardService = {
  // GET /api/dashboard/admin
  getAdminData: () => api.get('/dashboard/admin'),

  // GET /api/dashboard/hr
  getHRData: () => api.get('/dashboard/hr'),

  // GET /api/dashboard/manager
  getManagerData: () => api.get('/dashboard/manager'),
};
