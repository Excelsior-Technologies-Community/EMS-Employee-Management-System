import api from './api';

export const analyticsService = {
  
  getEmployeesByDepartment: (params = {}) => api.get('/analytics/employees-by-department', { params }),

  
  getEmployeesByRole: (params = {}) => api.get('/analytics/employees-by-role', { params }),

  
  getMonthlyEmployeeJoining: (params = {}) => api.get('/analytics/employee-joining', { params }),

  
  getMonthlyAttendanceStats: (params = {}) => api.get('/analytics/attendance', { params }),


  getMonthlyLeaveStats: (params = {}) => api.get('/analytics/leaves', { params }),

  getLeaveTypeStats: (params = {}) => api.get('/analytics/leave-types', { params }),
  getEmployeeStatusStats: (params = {}) => api.get('/analytics/employee-status', { params }),
};
