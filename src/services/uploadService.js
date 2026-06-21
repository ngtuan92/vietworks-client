// src/services/uploadService.js
import api from './api';

const uploadFile = async (endpoint, file) => {
  if (!file) {
    throw new Error('Vui lòng chọn file để upload');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post(endpoint, formData);
  return response.data;
};

const uploadService = {
  uploadCompanyImage: async (file) => uploadFile('/uploads/company-image', file),
  uploadLegalDocument: async (file) => uploadFile('/uploads/company-image', file),
  uploadAvatar: async (file) => uploadFile('/uploads/avatar', file),
};

export default uploadService;