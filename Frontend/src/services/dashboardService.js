import api from './api';

export const dashboardService = {
  // GET /api/dashboard/employee
  getEmployeeData: () => api.get('/dashboard/employee'),
};
