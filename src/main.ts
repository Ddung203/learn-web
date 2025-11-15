import './style.css';

import 'animate.css';
import 'primeicons/primeicons.css';
// import 'primevue/resources/themes/aura-light-amber/theme.css';
import 'primevue/resources/themes/aura-light-green/theme.css';

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import PrimeVue from 'primevue/config';

import { createApp } from 'vue';
import App from './App.vue';
import { importPrimeVueComponents } from './libs';
import appRouter from './routes';
import i18n from './locales';
import { useAuthStore, useCardSetStore } from './stores';
import syncService from './services/sync.service';
import indexedDBService from './services/indexeddb.service';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(PrimeVue);
importPrimeVueComponents(app);
app.use(pinia);
app.use(i18n);
app.use(appRouter);

app.mount('#app');

// Initialize services and stores
(async () => {
  try {
    // Initialize IndexedDB
    await indexedDBService.init();
    console.log('IndexedDB initialized');

    // Initialize auth store
    const authStore = useAuthStore();
    await authStore.initialize();

    // Initialize card set store
    const cardSetStore = useCardSetStore();
    await cardSetStore.initialize();
    console.log('Stores initialized');

    // Initialize sync service
    await syncService.initialize();
    console.log('Sync service initialized');

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.warn('Service Worker registration failed:', error);
          });
      });
    }
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
})();
