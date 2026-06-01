
import axios from 'axios';

const handleBlockedAccount = (error) => {
  if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_BANNED') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    try {
      window.dispatchEvent(new Event('auth_changed'));
      window.dispatchEvent(new CustomEvent('account_blocked', {
        detail: {
          message: error.response.data.message,
          banReason: error.response.data.banReason || null,
          bannedAt: error.response.data.bannedAt || null
        }
      }));
    } catch (e) {
      // ignore
    }
    return true;
  }

  return false;
};

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  withCredentials: true,
});

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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (handleBlockedAccount(error)) {
      return Promise.reject(error);
    }
    
    // TrÃ¡nh vÃ²ng láº·p vÃ´ háº¡n vÃ  chá»‰ xá»­ lÃ½ khi lá»—i 401 xáº£y ra
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Náº¿u yÃªu cáº§u refresh token chÃ­nh nÃ³ bá»‹ 401, logout ngay láº­p tá»©c
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        try {
          window.dispatchEvent(new Event('auth_changed'));
          window.dispatchEvent(new Event('unauthorized_access'));
        } catch (e) {
          // ignore
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data?.success && response.data?.accessToken) {
          const newToken = response.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          processQueue(null, newToken);
          isRefreshing = false;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        try {
          window.dispatchEvent(new Event('auth_changed'));
          window.dispatchEvent(new Event('unauthorized_access'));
        } catch (e) {
          // ignore
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

