// src/services/employerCompanyService.js
import api from './api';

const employerCompanyService = {
  getMyCompanyProfile: async () => {
    const response = await api.get('/employer/company/profile');
    return response.data;
  },
  submitMyCompanyForVerification: async () => {
  const response = await api.post('/employer/company/profile/submit-verification');
  return response.data;
},

  updateMyCompanyProfile: async ({
    name,
    taxCode,
    website,
    industryIds,
    size,
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
      industryIds,
      size,
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