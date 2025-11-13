import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AvailableLocale } from '~/locales';
import i18n from '~/locales';
import type { WritableComputedRef } from 'vue';

const LOCALE_STORAGE_KEY = 'chocolearn-locale';

// Helper to get initial locale
const getInitialLocale = (): AvailableLocale => {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'vi' || stored === 'en') {
      return stored as AvailableLocale;
    }
  } catch (e) {
    console.error('Error reading locale from localStorage:', e);
  }
  return 'vi'; // default
};

export const useLocaleStore = defineStore('locale', () => {
  const currentLocale = ref<AvailableLocale>(getInitialLocale());

  const isVietnamese = computed(() => currentLocale.value === 'vi');
  const isEnglish = computed(() => currentLocale.value === 'en');

  const setLocale = (locale: AvailableLocale) => {
    currentLocale.value = locale;
    if (i18n.global && 'locale' in i18n.global) {
      (i18n.global.locale as unknown as WritableComputedRef<AvailableLocale>).value = locale;
    }
    
    // Save to localStorage
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch (e) {
      console.error('Error saving locale to localStorage:', e);
    }
    
    document.documentElement.setAttribute('lang', locale);
  };

  const toggleLocale = () => {
    const newLocale: AvailableLocale = currentLocale.value === 'vi' ? 'en' : 'vi';
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
});
