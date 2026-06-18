import api from './api';

const notificationService = {
  async getMyNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }
};

export default notificationService;
