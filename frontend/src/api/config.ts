import axios from 'axios';
import { retryOperation } from './errorUtils';
import { store } from '../redux/Store';
import { resetCredentials } from '../redux/AuthReducer';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout for comfortable AI responses
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add request interceptor to attach auth token
api.interceptors.request.use((config) => {

  const { token } = store.getState().auth;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle unauthorized access
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            Promise.reject(err)
            store.dispatch(resetCredentials())
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await api.post('/auth/refresh', {
          refreshToken: localStorage.getItem('refresh_token')
        });

        const { token } = response.data;
        localStorage.setItem('auth_token', token);

        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        processQueue(null, token);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        //window.location.href = '/login?session=expired';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const retryAfter = error.response.headers['retry-after'] || 1;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Wrap API methods with retry logic
export const apiWithRetry = {
  async get<T>(url: string, config?: any) {
    return retryOperation(() => api.get<T>(url, config));
  },
  async post<T>(url: string, data?: any, config?: any) {
    return retryOperation(() => api.post<T>(url, data, config));
  },
  async put<T>(url: string, data?: any, config?: any) {
    return retryOperation(() => api.put<T>(url, data, config));
  },
  async patch<T>(url: string, data?: any, config?: any) {
    return retryOperation(() => api.patch<T>(url, data, config));
  },
  async delete<T>(url: string, config?: any) {
    return retryOperation(() => api.delete<T>(url, config));
  }
};