import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale.store';

export const useLocale = () => {
  const { t, locale } = useI18n();
  const localeStore = useLocaleStore();

  const { currentLocale, isVietnamese, isEnglish } = storeToRefs(localeStore);

  return {
    t,
    locale,
    currentLocale,
    isVietnamese,
    isEnglish,
    setLocale: localeStore.setLocale,
    toggleLocale: localeStore.toggleLocale,
  };
};
