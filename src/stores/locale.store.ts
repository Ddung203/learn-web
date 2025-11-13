import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AvailableLocale } from '~/locales';
import i18n from '~/locales';

export const useLocaleStore = defineStore(
  'locale',
  () => {
    const currentLocale = ref<AvailableLocale>(
      (localStorage.getItem('locale') as AvailableLocale) || 'vi'
    );

    const isVietnamese = computed(() => currentLocale.value === 'vi');
    const isEnglish = computed(() => currentLocale.value === 'en');

    const setLocale = (locale: AvailableLocale) => {
      currentLocale.value = locale;
      (i18n.global.locale as any).value = locale;
      localStorage.setItem('locale', locale);
      document.documentElement.setAttribute('lang', locale);
    };

    const toggleLocale = () => {
      const newLocale: AvailableLocale =
        currentLocale.value === 'vi' ? 'en' : 'vi';
      setLocale(newLocale);
    };

    // Set initial locale
    setLocale(currentLocale.value);

    return {
      currentLocale,
      isVietnamese,
      isEnglish,
      setLocale,
      toggleLocale,
    };
  },
  {
    persist: true,
  }
);
