import axios from 'axios';
import api from './api';

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

const notifyAuthChanged = () => {
  try {
    window.dispatchEvent(new Event('auth_changed'));
  } catch {
    // ignore
  }
};

const authService = {
  registerJobseeker: async (userData) => {
    const response = await axios.post(`${API_URL}/register/jobseeker`, userData, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  registerEmployer: async (payload) => {
    const response = await axios.post(`${API_URL}/register/employer`, payload, { withCredentials: true });
    return response.data;
  },

  verifyEmployerOtp: async ({ email, otp }) => {
    const response = await axios.post(`${API_URL}/register/employer/verify-otp`, { email, otp }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  resendEmployerOtp: async ({ email }) => {
    const response = await axios.post(`${API_URL}/register/employer/resend-otp`, { email }, { withCredentials: true });
    return response.data;
  },

  login: async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  loginJobseeker: async (credentials) => {
    const response = await axios.post(`${API_URL}/login/jobseeker`, credentials, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  loginEmployer: async (credentials) => {
    const response = await axios.post(`${API_URL}/login/employer`, credentials, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  googleLoginJobseeker: async ({ tokenId }) => {
    const response = await axios.post(`${API_URL}/google/jobseeker`, { tokenId }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  googleLoginEmployer: async ({ tokenId }) => {
    const response = await axios.post(`${API_URL}/google/employer`, { tokenId }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  googleLoginGeneric: async ({ tokenId }) => {
    const response = await axios.post(`${API_URL}/google`, { tokenId }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  linkedinLoginJobseeker: async ({ code }) => {
    const response = await axios.post(`${API_URL}/linkedin/jobseeker`, { code }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  linkedinLoginEmployer: async ({ code }) => {
    const response = await axios.post(`${API_URL}/linkedin/employer`, { code }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  linkedinLoginGeneric: async ({ code }) => {
    const response = await axios.post(`${API_URL}/linkedin`, { code }, { withCredentials: true });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChanged();
    }
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword, confirmNewPassword }) => {
    const response = await api.patch('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      const currentUser = response.data.user || response.data.data;
      localStorage.setItem('user', JSON.stringify(currentUser));
      notifyAuthChanged();
    }
    return response.data;
  },

  forgotPassword: async ({ email }) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email }, { withCredentials: true });
    return response.data;
  },

  resetPassword: async ({ token, password, confirmPassword }) => {
    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password, confirmPassword }, { withCredentials: true });
    return response.data;
  },

  logout: async () => {
    await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    notifyAuthChanged();
  }
};

export default authService;



