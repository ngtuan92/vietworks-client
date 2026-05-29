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
  }
};

export default companyMasterDataService;