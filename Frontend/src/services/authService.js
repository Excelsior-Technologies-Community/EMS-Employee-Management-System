import api from './api';

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (resetToken, newPassword) => api.post('/auth/reset-password', { resetToken, newPassword }),
};
