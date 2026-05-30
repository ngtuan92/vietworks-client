// src/services/employerAccountService.js
import api from './api';   // Import instance axios đã config

export const employerAccountService = {
  getMyRepresentativeProfile: async () => {
    const response = await api.get('/employer/account/representative');
    return response.data;
  },

  updateMyRepresentativeProfile: async ({ representativeName, gender, phone }) => {
    const response = await api.put('/employer/account/representative', {
      representativeName,
      gender,
      phone
    });

    return response.data;
  },

  getMyEmployerLoginInfo: async () => {
    const response = await api.get('/employer/account');
    return response.data;
  },

  updateMyEmployerPassword: async ({
    currentPassword,
    newPassword,
    confirmNewPassword
  }) => {
    const response = await api.put('/employer/account/password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });

    return response.data;
  }
};

export default employerAccountService;