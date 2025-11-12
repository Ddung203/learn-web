import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from '~/stores';
import { hasPermission, ROLE, type RoleValue } from '~/constants';
import type { RouteMeta } from '~/interfaces/route.interface';

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore();
  const meta = to.meta as unknown as RouteMeta | undefined;

  if (!meta) {
    return next();
  }

  const { requiredAuth, requiredRole, requiresEmailVerification } = meta;

  // Check if route requires authentication
  if (requiredAuth && !authStore.getIsLoggedIn) {
    return next('/login');
  }

  // Check if user's email is verified (if required)
  if (requiresEmailVerification && authStore.user?.emailVerified !== 1) {
    return next('/verify-otp');
  }

  // Check role permissions
  if (requiredRole && requiredRole.length > 0) {
    const userRole = authStore.user?.role || ROLE.OTHER;

    if (userRole === ROLE.ROOT) {
      return next();
    }

    if (!hasPermission(userRole, requiredRole)) {
      // User doesn't have required role
      return next('/introduction');
    }
  }

  next();
};

export const redirectIfAuthenticated = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authStore = useAuthStore();

  if (authStore.getIsLoggedIn) {
    const userRole = authStore.user?.role || ROLE.OTHER;

    // Redirect based on user role
    switch (userRole) {
      case ROLE.ROOT:
        return next('/stat');
      case ROLE.ADMIN:
        return next('/stat');
      case ROLE.INTERVIEWER:
        return next('/introduction');
      case ROLE.USER:
        return next('/introduction');
      default:
        return next('/introduction');
    }
  }

  next();
};
