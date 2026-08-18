import api from './api';

export const leaveService = {
  applyLeave: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/my'),
  getLeaveTypes: () => api.get('/leave-types'),
};
