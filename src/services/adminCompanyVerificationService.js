// src/services/adminCompanyVerificationService.js
import api from './api';

const adminCompanyVerificationService = {
  getPendingCompanies: async () => {
    const response = await api.get('/admin/company-verifications/pending');
    return response.data;
  },

  getCompanyVerificationDetail: async (companyId) => {
    const response = await api.get(`/admin/company-verifications/${companyId}`);
    return response.data;
  },

  approveCompanyVerification: async (companyId) => {
    const response = await api.patch(`/admin/company-verifications/${companyId}/approve`);
    return response.data;
  },

  rejectCompanyVerification: async (companyId, rejectionReason) => {
    const response = await api.patch(`/admin/company-verifications/${companyId}/reject`, {
      rejectionReason
    });
    return response.data;
  }
};

export default adminCompanyVerificationService;