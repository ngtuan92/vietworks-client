// src/services/uploadService.js
import api from './api';

const uploadService = {
  uploadCompanyImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/uploads/company-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  }
};

export default uploadService;