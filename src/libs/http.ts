import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axiosInstance from './axios';

type ApiResponse<T> = Promise<AxiosResponse<T>>;

export const httpCaller = {
  get<T>(
    url: string,
    params?: any,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    return axiosInstance.get<T>(url, {
      ...(config || {}),
      params: {
        ...(config?.params || {}),
        ...(params || {}),
      },
    });
  },

  post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    return axiosInstance.post<T>(url, data, config);
  },

  put<T>(url: string, data?: any, config?: AxiosRequestConfig): ApiResponse<T> {
    return axiosInstance.put<T>(url, data, config);
  },

  patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    return axiosInstance.patch<T>(url, data, config);
  },

  delete<T>(url: string, config?: AxiosRequestConfig): ApiResponse<T> {
    return axiosInstance.delete<T>(url, config);
  },

  upload<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): ApiResponse<T> {
    return axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      ...config,
    });
  },
};
