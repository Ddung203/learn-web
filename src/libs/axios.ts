import axios, { type InternalAxiosRequestConfig } from 'axios';

import { STORE_IDS } from '~/stores';
import { APP_CONFIG } from '../config';

const axiosInstance = axios.create({
  baseURL: `${APP_CONFIG.API_URL}${APP_CONFIG.API_VERSION}`,
  timeout: APP_CONFIG.AXIOS_TIMEOUT,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth = JSON.parse(localStorage.getItem(STORE_IDS.AUTH) || '{}');

    if (auth?.accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`;
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
