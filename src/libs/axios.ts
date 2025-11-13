import axios, { type InternalAxiosRequestConfig } from 'axios';
import { APP_CONFIG } from '../config';

const axiosInstance = axios.create({
  baseURL: `${APP_CONFIG.API_URL}${APP_CONFIG.API_VERSION}`,
  timeout: APP_CONFIG.AXIOS_TIMEOUT,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Accept-Language'] = APP_CONFIG.I18N_LANGUAGE;

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);

    return Promise.reject({
      message: 'Request setup failed',
      originalError: error,
    });
  }
);

export default axiosInstance;
