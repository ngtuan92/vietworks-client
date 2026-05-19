import api from './api';

const cvService = {
  getActiveTemplates: async (params) => {
    const response = await api.get('/cv-templates', { params });
    return response.data;
  },

  getTemplatePreview: async (id) => {
    const response = await api.get(`/cv-templates/${id}/preview`);
    return response.data;
  },

  createCv: async (data) => {
    const response = await api.post('/cvs', data);
    return response.data;
  },

  updateCv: async (id, data) => {
    const response = await api.put(`/cvs/${id}`, data);
    return response.data;
  },

  getCvById: async (id) => {
    const response = await api.get(`/cvs/${id}`);
    return response.data;
  },

  getUserCvs: async () => {
    const response = await api.get('/cvs');
    return response.data;
  },

  deleteCv: async (id) => {
    const response = await api.delete(`/cvs/${id}`);
    return response.data;
  }
};

export default cvService;
