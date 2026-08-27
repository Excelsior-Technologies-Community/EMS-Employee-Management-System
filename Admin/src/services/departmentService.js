import api from './api';

export const departmentService = {
 
  getAll: () =>
    api.get('/departments'),


  getById: (id) =>
    api.get(`/departments/${id}`),

  
  add: (payload) =>
    api.post('/departments', payload),

 
  update: (id, payload) =>
    api.put(`/departments/${id}`, payload),

  
  remove: (id) =>
    api.delete(`/departments/${id}`),
};
