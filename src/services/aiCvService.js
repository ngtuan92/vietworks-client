import api from './api';

const aiCvService = {
  createReview: async (formData) => {
    const response = await api.post('/ai-cv-reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserReviews: async () => {
    const response = await api.get('/ai-cv-reviews');
    return response.data;
  },

  getReviewById: async (id) => {
    const response = await api.get(`/ai-cv-reviews/${id}`);
    return response.data;
  },
};

export default aiCvService;
