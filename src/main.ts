import './style.css';

import 'animate.css';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/aura-light-amber/theme.css';

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import PrimeVue from 'primevue/config';

import { createApp } from 'vue';
import App from './App.vue';
import { importPrimeVueComponents } from './libs';
import appRouter from './routes';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(PrimeVue);
importPrimeVueComponents(app);
app.use(pinia);
app.use(appRouter);

app.mount('#app');
