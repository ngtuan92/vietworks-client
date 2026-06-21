import api from './api';

const jobseekerProfileService = {
  getMyProfile: async () => {
    const response = await api.get('/jobseeker/profile');
    return response.data;
  },

  updateMyProfile: async ({ fullName, phone, avatarUrl }) => {
    const payload = { fullName, phone };
    if (avatarUrl !== undefined) payload.avatarUrl = avatarUrl;
    const response = await api.put('/jobseeker/profile', payload);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/uploads/avatar', formData);
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
