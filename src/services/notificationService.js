import api from './api';

const notificationService = {
  async getMyNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    window.dispatchEvent(new CustomEvent('vietworks:notification-read'));
    return response.data;
  },
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    window.dispatchEvent(new CustomEvent('vietworks:notification-read'));
    return response.data;
  },
  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    window.dispatchEvent(new CustomEvent('vietworks:notification-read'));
    return response.data;
  },
  async bulkDeleteNotifications(ids) {
    const response = await api.post('/notifications/bulk-delete', { ids });
    window.dispatchEvent(new CustomEvent('vietworks:notification-read'));
    return response.data;
  },
  async getSettings() {
    const response = await api.get('/notification-settings');
    return response.data;
  },
  async updateSettings(settings) {
    const response = await api.patch('/notification-settings', { settings });
    return response.data;
  }
};

export default notificationService;
