import api from './api';

const jobseekerProfileService = {
  getMyProfile: async () => {
    const response = await api.get('/jobseeker/profile');
    return response.data;
  },

  updateMyProfile: async ({ fullName, phone }) => {
    const response = await api.put('/jobseeker/profile', { fullName, phone });
    return response.data;
  },

  updatePrivacy: async ({ allowEmployerSearch }) => {
    const response = await api.patch('/jobseeker/privacy', { allowEmployerSearch });
    return response.data;
  },

  getNotificationSettings: async () => {
    const response = await api.get('/jobseeker/notification-settings');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await api.patch('/jobseeker/notification-settings', { settings });
    return response.data;
  },
};

export default jobseekerProfileService;
