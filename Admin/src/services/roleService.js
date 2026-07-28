import api from './api';

export const roleService = {
  // GET /api/roles
  getAll: () =>
    api.get('/roles'),

  // POST /api/roles
  add: (payload) =>
    api.post('/roles', payload),
};
