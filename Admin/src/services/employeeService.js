import api from './api';

export const employeeService = {
  // GET /api/employees  (optional: ?search=&page=&limit=)
  getAll: ({ search = '', page = 1, limit = 10 } = {}) => {
    const params = {};
    if (search) params.search = search;
    if (page)   params.page   = page;
    if (limit)  params.limit  = limit;
    return api.get('/employees', { params });
  },

  // GET /api/employees/:id
  getById: (id) =>
    api.get(`/employees/${id}`),

  // POST /api/employees/add
  add: (payload) =>
    api.post('/employees/add', payload),

  // PUT /api/employees/:id
  update: (id, payload) =>
    api.put(`/employees/${id}`, payload),

  // PATCH /api/employees/:id/status
  toggleStatus: (id, status) =>
    api.patch(`/employees/${id}/status`, { status }),

  // DELETE /api/employees/:id
  remove: (id) =>
    api.delete(`/employees/${id}`),

  // Change password — reuses PUT /api/employees/:id with only password field
  changePassword: (id, password) =>
    api.put(`/employees/${id}`, { password }),

  // Fetch roles + departments for Add/Edit form dropdowns
  getFormOptions: () =>
    Promise.all([
      api.get('/roles'),
      api.get('/departments'),
    ]).then(([rolesRes, deptsRes]) => ({
      data: {
        success: true,
        data: {
          roles: rolesRes.data.data,
          departments: deptsRes.data.data,
        },
      },
    })),
};
