import api from './api';

export const attendanceService = {
  /**
   * Check in with the user's location coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} accuracy 
   */
  checkIn: (latitude, longitude, accuracy) =>
    api.post('/attendance/check-in', { latitude, longitude, accuracy }),

  /**
   * Check out with the user's location coordinates
   * @param {number} latitude 
   * @param {number} longitude 
   * @param {number} accuracy 
   */
  checkOut: (latitude, longitude, accuracy) =>
    api.post('/attendance/check-out', { latitude, longitude, accuracy }),

  /**
   * Retrieve today's attendance record (check-in and check-out status)
   */
  getToday: () =>
    api.get('/attendance/status'),

  /**
   * Fetch attendance history within a date range (optional endpoint)
   * @param {string} from - start date
   * @param {string} to - end date
   */
  getMyHistory: (from, to) =>
    api.get('/attendance/my', { params: { from, to } }),
};
