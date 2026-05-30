// src/services/employerCompanyService.js
import api from './api';

const employerCompanyService = {
  getMyCompanyProfile: async () => {
    const response = await api.get('/employer/company/profile');
    return response.data;
  },

  updateMyCompanyProfile: async ({
    name,
    taxCode,
    website,
    industryId,
    sizeId,
    email,
    phone,
    avatarUrl,
    coverUrl,
    description,
    businessLicenseFile
  }) => {
    const response = await api.put('/employer/company/profile', {
      name,
      taxCode,
      website,
      industryId,
      sizeId,
      email,
      phone,
      avatarUrl,
      coverUrl,
      description,
      businessLicenseFile
    });

    return response.data;
  }
};

export default employerCompanyService;