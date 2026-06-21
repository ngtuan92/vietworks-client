import api from './api';

const adminNotificationService = {
  async getEmailLogs(params = {}) {
    const response = await api.get('/admin/email-logs', { params });
    return response.data;
  },
  async sendBroadcast(payload) {
    const response = await api.post('/admin/notifications/broadcast', payload);
    return response.data;
  },
  async sendToUser(userId, payload) {
    const response = await api.post(`/admin/notifications/users/${userId}`, payload);
    return response.data;
  },
  async getBroadcasts(params = {}) {
    const response = await api.get('/admin/notifications/broadcasts', { params });
    return response.data;
  }
};

export default adminNotificationService;
