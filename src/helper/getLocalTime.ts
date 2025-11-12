import { APP_CONFIG } from '~/config';

export const getLocalTime = () => {
  return new Date().toLocaleString('vi-VN', {
    timeZone: APP_CONFIG.TIME_ZONE,
  });
};
