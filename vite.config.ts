import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  css: {
    devSourcemap: true,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'primevue/panelmenu',
      'primevue/button',
      'primevue/dialog',
      'primevue/dropdown',
      'primevue/inputtext',
      'primevue/password',
      'primevue/sidebar',
      'primevue/toast',
      'primevue/datatable',
      'primevue/column',
      'primevue/card',
      'primevue/fileupload',
    ],
  },
});
