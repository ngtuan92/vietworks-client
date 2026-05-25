  import axios from 'axios';

  const API_BASE_URL = 'http://localhost:8080/api';   // Thay đổi nếu port khác

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000, // 15 giây
  });

  // Interceptor thêm Token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor xử lý lỗi response
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        // Có thể logout tự động hoặc redirect về login
        localStorage.removeItem('accessToken');
        // window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );

  export default api;