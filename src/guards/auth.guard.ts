import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '~/stores';

export const authGuard = async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  // Check if route requires authentication
  const requiresAuth = to.meta.requiredAuth as boolean;

  if (requiresAuth && !authStore.isAuthenticated()) {
    // Redirect to login if not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }

  // Allow navigation
  next();
};
