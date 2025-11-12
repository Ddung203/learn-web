import { defineStore } from 'pinia';

import { STORE_IDS } from './store-id';

export const useUIStore = defineStore(STORE_IDS.UI, {
  state: () => ({
    visibleMenu: false,
  }),
  getters: {},
  actions: {
    toggleMenu() {
      this.visibleMenu = !this.visibleMenu;
    },
  },
});
