// src/services/companyMasterDataService.js
import api from './api';

const companyMasterDataService = {
  getCompanyIndustries: async () => {
    const response = await api.get('/company-master-data/industries');
    return response.data;
  },

  getCompanySizes: async () => {
    const response = await api.get('/company-master-data/sizes');
    return response.data;
  },

  createCompanyIndustry: async (data) => {
    const response = await api.post('/admin/company-master-data/industries', data);
    return response.data;
  },
  updateCompanyIndustry: async (id, data) => {
    const response = await api.put(`/admin/company-master-data/industries/${id}`, data);
    return response.data;
  },
  deleteCompanyIndustry: async (id) => {
    const response = await api.delete(`/admin/company-master-data/industries/${id}`);
    return response.data;
  },

  createCompanySize: async (data) => {
    const response = await api.post('/admin/company-master-data/sizes', data);
    return response.data;
  },
  updateCompanySize: async (id, data) => {
    const response = await api.put(`/admin/company-master-data/sizes/${id}`, data);
    return response.data;
  },
  deleteCompanySize: async (id) => {
    const response = await api.delete(`/admin/company-master-data/sizes/${id}`);
    return response.data;
  }
};

export default companyMasterDataService;