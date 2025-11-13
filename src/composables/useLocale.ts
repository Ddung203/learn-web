import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale.store';

export const useLocale = () => {
  const { t, locale } = useI18n();
  const localeStore = useLocaleStore();

  return {
    t,
    locale,
    currentLocale: localeStore.currentLocale,
    isVietnamese: localeStore.isVietnamese,
    isEnglish: localeStore.isEnglish,
    setLocale: localeStore.setLocale,
    toggleLocale: localeStore.toggleLocale,
  };
};
