import { defineStore } from 'pinia';
import { STORE_IDS } from './store-id';
import { ROLE } from '~/constants';
import { roleOptions } from '~/constants/vue-ref';

import type { IUser } from '~/interfaces';

interface AuthState {
  isLoggedIn: boolean;
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore(STORE_IDS.AUTH, {
  state: (): AuthState => ({
    isLoggedIn: false,
    user: null,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    getIsLoggedIn: (state) => state.isLoggedIn || false,
    getStudentName: (state) => {
      if (!state.user) return 'Guest';
      const roleLabel =
        roleOptions.value.find((option) => option.value === state.user?.role)
          ?.label || 'Người dùng';
      return `${state.user?.fullName} - ${roleLabel}`;
    },
    getRole: (state) => state.user?.role || ROLE.OTHER,
  },

  actions: {
    setIsLoggedIn(isLoggedIn: boolean) {
      this.isLoggedIn = isLoggedIn;
    },

    setUser(user: IUser) {
      this.user = user;
    },

    updateUserFullName(fullName: string) {
      if (this.user) {
        this.user.fullName = fullName;
      }
    },

    setAccessToken(accessToken: string) {
      this.accessToken = accessToken;
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
    },

    logout() {
      this.reset();
    },

    reset() {
      localStorage.clear();
      this.isLoggedIn = false;
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
    },
  },

  persist: true,
});
