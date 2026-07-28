import api from './api';

export const departmentService = {
  // GET /api/departments
  getAll: () =>
    api.get('/departments'),

  // GET /api/departments/:id
  getById: (id) =>
    api.get(`/departments/${id}`),

  // POST /api/departments
  add: (payload) =>
    api.post('/departments', payload),

  // PUT /api/departments/:id
  update: (id, payload) =>
    api.put(`/departments/${id}`, payload),

  // DELETE /api/departments/:id
  remove: (id) =>
    api.delete(`/departments/${id}`),
};
