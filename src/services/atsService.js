import api from './api';

const atsService = {
  async getAtsJobs() {
    const response = await api.get('/employer/ats/jobs');
    return response.data;
  },
  async getApplicationsByJob(jobId, params = {}) {
    const response = await api.get(`/employer/jobs/${jobId}/applications`, { params });
    return response.data;
  },
  async getApplicationDetail(id) {
    const response = await api.get(`/employer/applications/${id}`);
    return response.data;
  },
  async markApplicationAsViewed(id) {
    const response = await api.patch(`/employer/applications/${id}/view`);
    return response.data;
  },
  async getApplicationCvBlob(id) {
    const response = await api.get(`/employer/applications/${id}/cv-view`, { responseType: 'blob' });
    return response.data;
  },
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },
  async markNotificationAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  }
};

export default atsService;
