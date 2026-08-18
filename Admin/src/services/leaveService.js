import api from './api';

export const leaveService = {
  // GET /api/leaves - retrieves all leaves (for Admin/HR/Manager)
  getAll: () => api.get('/leaves'),

  // GET /api/leaves/pending - retrieves pending leaves
  getPending: () => api.get('/leaves/pending'),

  // PUT /api/leaves/:id/approve - approve a pending leave
  approve: (id, approval_reason) =>
    api.put(`/leaves/${id}/approve`, { approval_reason }),

  // PUT /api/leaves/:id/reject - reject a pending leave
  reject: (id, rejection_reason) =>
    api.put(`/leaves/${id}/reject`, { rejection_reason }),

  // GET /api/leave-types - retrieves all leave types
  getLeaveTypes: () => api.get('/leave-types'),
};
