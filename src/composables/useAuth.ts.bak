import { computed } from 'vue';
import { useAuthStore } from '~/stores';
import { hasPermission, ROLE, type RoleValue } from '~/constants';

export const useAuth = () => {
  const authStore = useAuthStore();

  const isLoggedIn = computed(() => authStore.getIsLoggedIn);
  const user = computed(() => authStore.user);
  const userRole = computed((): RoleValue => authStore.getRole);

  const hasRole = (allowedRoles: RoleValue[]): boolean => {
    if (userRole.value === ROLE.ROOT) return true;
    return hasPermission(userRole.value, allowedRoles);
  };

  const isRoot = computed(() => userRole.value === ROLE.ROOT);
  const isAdmin = computed(() => userRole.value === ROLE.ADMIN);
  const isInterviewer = computed(() => userRole.value === ROLE.INTERVIEWER);
  const isUser = computed(() => userRole.value === ROLE.USER);
  const isGuest = computed(() => userRole.value === ROLE.OTHER);

  const canManageQuestions = computed(() =>
    hasRole([ROLE.ADMIN, ROLE.INTERVIEWER])
  );

  const canViewStats = computed(() => hasRole([ROLE.ADMIN]));

  const canManageUsers = computed(() =>
    hasRole([ROLE.ADMIN, ROLE.INTERVIEWER])
  );

  const canTakeTest = computed(() => hasRole([ROLE.USER]));

  // ROOT-specific permissions
  const canManageSystem = computed(() => hasRole([ROLE.ROOT]));
  const canViewSystemLogs = computed(() => hasRole([ROLE.ROOT]));
  const canConfigureSystem = computed(() => hasRole([ROLE.ROOT]));

  // Enhanced permissions (ROOT gets everything)
  const canManageAllUsers = computed(() => hasRole([ROLE.ROOT, ROLE.ADMIN]));
  const canViewAllStats = computed(() => hasRole([ROLE.ROOT, ROLE.ADMIN]));

  return {
    // State
    isLoggedIn,
    user,
    userRole,

    // Role checks
    hasRole,
    isRoot,
    isAdmin,
    isInterviewer,
    isUser,
    isGuest,

    // Permission checks
    canManageQuestions,
    canViewStats,
    canManageUsers,
    canTakeTest,

    // ROOT-specific permissions
    canManageSystem,
    canViewSystemLogs,
    canConfigureSystem,
    canManageAllUsers,
    canViewAllStats,

    // Actions
    login: authStore.setIsLoggedIn,
    logout: authStore.logout,
    setUser: authStore.setUser,
    setAccessToken: authStore.setAccessToken,
    setRefreshToken: authStore.setRefreshToken,
  };
};
