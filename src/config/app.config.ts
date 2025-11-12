export interface IAppConfig {
  TIME_ZONE: string;
  APP_NAME: string;
  NODE_ENV: string;
  API_URL: string;
  API_VERSION: string;
  AXIOS_TIMEOUT: number;
  I18N_LANGUAGE: string;
}

export const APP_CONFIG: IAppConfig = {
  TIME_ZONE: import.meta.env.VITE_TZ || 'Asia/Ho_Chi_Minh',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Base Web App',
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  API_VERSION: import.meta.env.VITE_API_VERSION || '/api/v1',
  AXIOS_TIMEOUT: import.meta.env.VITE_AXIOS_TIMEOUT ?? 15_000,
  I18N_LANGUAGE: import.meta.env.VITE_I18N_LANGUAGE || 'vi',
};
