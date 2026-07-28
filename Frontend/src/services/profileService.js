import api from './api';

export const profileService = {
  getProfile: (id) => api.get(`/employees/${id}`),
  updateProfile: (id, payload) => api.put(`/employees/${id}`, payload),
  changePassword: (id, password) => api.put(`/employees/${id}`, { password }),
};
