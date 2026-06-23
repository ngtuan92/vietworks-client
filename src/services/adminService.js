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
  }
};

export default adminService;
