import api from './api';

export const teamService = {
  // GET /api/teams
  getAll: () => api.get('/teams'),

  // GET /api/teams/:id
  getById: (id) => api.get(`/teams/${id}`),

  // POST /api/teams
  create: (payload) => api.post('/teams', payload),

  // PUT /api/teams/:id
  update: (id, payload) => api.put(`/teams/${id}`, payload),

  // POST /api/teams/:teamId/members
  addMember: (teamId, employeeId) =>
    api.post(`/teams/${teamId}/members`, { employee_id: employeeId }),

  // DELETE /api/teams/:teamId/members/:employeeId
  removeMember: (teamId, employeeId) =>
    api.delete(`/teams/${teamId}/members/${employeeId}`),

  // GET /api/teams/:teamId/members
  getMembers: (teamId) => api.get(`/teams/${teamId}/members`),

  // GET /api/teams/my-team
  getMyTeam: () => api.get('/teams/my-team'),

  // GET /api/dashboard/manager
  getManagerDashboard: () => api.get('/dashboard/manager'),
};
