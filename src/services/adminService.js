import api from './api';

const adminService = {
  getTemplates: async (params) => {
    const response = await api.get('/cv-templates/admin', { params });
    return response.data;
  },

  createTemplate: async (data) => {
    const response = await api.post('/cv-templates/admin', data);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await api.put(`/cv-templates/admin/${id}`, data);
    return response.data;
  },

  toggleTemplateStatus: async (id) => {
    const response = await api.patch(`/cv-templates/admin/${id}/status`);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/cv-templates/admin/${id}`);
    return response.data;
  },

  uploadTemplatePreview: async (id, file) => {
    const formData = new FormData();
    formData.append('previewImage', file);

    const response = await api.post(`/cv-templates/admin/${id}/preview-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCareerGroups: async () => {
    const response = await api.get('/cv-templates/career-groups');
    return response.data;
  },

  // ─── Analytics ───────────────────────────────────────────────────────
  /**
   * Thống kê tăng trưởng user theo ngày/tháng
   * @param {{ range?: '30days'|'90days'|'year'|'all' }} params
   */
  getUserGrowth: async (params = {}) => {
    const response = await api.get('/admin/analytics/user-growth', { params });
    return response.data?.data;
  },

  /**
   * Thống kê số lượng job theo trạng thái
   * @param {{ startDate?: string, endDate?: string }} params
   */
  getJobAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/jobs', { params });
    return response.data?.data;
  },

  /**
   * Thống kê applications: byStatus, top jobs, top companies
   * @param {{ startDate?: string, endDate?: string, topLimit?: number }} params
   */
  getApplicationAnalytics: async (params = {}) => {
    const response = await api.get('/admin/analytics/applications', { params });
    return response.data?.data;
  },

  /**
   * Tỷ lệ hồ sơ được approve / hire
   * @param {{ startDate?: string, endDate?: string }} params
   */
  getHiringSuccess: async (params = {}) => {
    const response = await api.get('/admin/analytics/hiring-success', { params });
    return response.data?.data;
  }
};

export default adminService;
