import api from './api';

export const authService = {
  // POST /api/auth/login
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  // POST /api/auth/logout  (requires token — handled by interceptor)
  logout: () =>
    api.post('/auth/logout'),
};
