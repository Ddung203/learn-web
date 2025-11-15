import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/stores';

export function useTokenRefresh() {
  const authStore = useAuthStore();
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleTokenRefresh = () => {
    // Clear existing timer
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // JWT TTL is 1 hour (3600 seconds)
    // Refresh 5 minutes (300 seconds) before expiry
    const REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // 5 minutes in ms
    const ACCESS_TOKEN_TTL = 60 * 60 * 1000; // 1 hour in ms
    const refreshTime = ACCESS_TOKEN_TTL - REFRESH_BEFORE_EXPIRY;

    refreshTimer = setTimeout(async () => {
      if (authStore.isAuthenticated && document.visibilityState === 'visible') {
        try {
          // Trigger a simple API call to force token refresh if needed
          // The interceptor will handle the actual refresh
          await authStore.fetchProfile();
          
          // Schedule next refresh
          scheduleTokenRefresh();
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }, refreshTime);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && authStore.isAuthenticated) {
      // When tab becomes visible again, schedule a refresh
      scheduleTokenRefresh();
    }
  };

  onMounted(() => {
    if (authStore.isAuthenticated) {
      scheduleTokenRefresh();
    }

    // Listen for tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onUnmounted(() => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  return {
    scheduleTokenRefresh,
  };
}
