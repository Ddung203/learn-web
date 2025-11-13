import { createI18n } from 'vue-i18n';
import en from './en';
import vi from './vi';
import { APP_CONFIG } from '~/config/app.config';

export type MessageSchema = typeof vi;
export type AvailableLocale = 'en' | 'vi';

const i18n = createI18n<[MessageSchema], AvailableLocale>({
  legacy: false,
  locale: APP_CONFIG.I18N_LANGUAGE as AvailableLocale,
  fallbackLocale: 'vi',
  messages: {
    en,
    vi,
  },
  globalInjection: true,
});

export default i18n;
