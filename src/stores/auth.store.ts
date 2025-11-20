import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import authService, {
  type IUser,
  type ILoginRequest,
  type IRegisterRequest,
} from '~/services/auth.service';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<IUser | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // Initialize: restore user if token exists
    const initialize = async () => {
      if (authService.isAuthenticated() && !user.value) {
        try {
          await fetchProfile();
        } catch (err) {
          console.error('Failed to restore user session:', err);
          logout();
        }
      }
    };

    const login = async (credentials: ILoginRequest) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await authService.login(credentials);
        user.value = response.user;
        return response;
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Login failed';
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const register = async (data: IRegisterRequest) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await authService.register(data);
        user.value = response.user;
        return response;
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Registration failed';
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        user.value = await authService.getProfile();
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to fetch profile';
        logout();
      } finally {
        loading.value = false;
      }
    };

    const logout = async () => {
      try {
        await authService.logout();
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        user.value = null;
        error.value = null;
      }
    };

    const logoutAll = async () => {
      try {
        await authService.logoutAll();
      } catch (err) {
        console.error('Logout all error:', err);
      } finally {
        user.value = null;
        error.value = null;
      }
    };

    const loginOrRegister = async (credentials: ILoginRequest) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await authService.loginOrRegister(credentials);
        user.value = response.user;
        return response;
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Login/Register failed';
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const updateProfile = async (data: {
      full_name?: string;
      avatar?: string;
      date_of_birth?: string;
      preferred_voice_id?: string;
    }) => {
      loading.value = true;
      error.value = null;
      try {
        const updatedUser = await authService.updateProfile(data);
        user.value = updatedUser;
        return updatedUser;
      } catch (err: any) {
        error.value = err.response?.data?.error || 'Failed to update profile';
        throw err;
      } finally {
        loading.value = false;
      }
    };

    const isAuthenticated = computed(() => !!user.value);

    return {
      user,
      loading,
      error,
      login,
      loginOrRegister,
      register,
      fetchProfile,
      updateProfile,
      logout,
      logoutAll,
      isAuthenticated,
      initialize,
    };
  },
  {
    persist: true,
  }
);
