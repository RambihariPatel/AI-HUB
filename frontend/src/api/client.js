import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Request interceptor: attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401, try to refresh token via Clerk
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to get a fresh token from Clerk (window.__clerk is available after Clerk loads)
        if (window.Clerk?.session) {
          const freshToken = await window.Clerk.session.getToken();
          if (freshToken) {
            localStorage.setItem('token', freshToken);
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;
            return api(originalRequest); // Retry with new token
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      localStorage.removeItem('token');
    }

    return Promise.reject(error);
  }
);

export default api;
