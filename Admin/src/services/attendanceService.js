import api from './api';

export const attendanceService = {
  // GET /api/attendance
  getAll: (params) =>
    api.get('/attendance', { params }),

  // POST /api/attendance/manual
  saveManual: (payload) =>
    api.post('/attendance/manual', payload),
};
