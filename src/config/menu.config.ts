import type { MenuItem } from '~/interfaces/route.interface';

export const createMenuItems = (
  navigateHandle: (path: string) => void,
  logout: () => void,
  isAuthenticated: boolean
): MenuItem[] => {
  // Base common items
  const homeItem: MenuItem = {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => navigateHandle('/introduction'),
  };

  const cardSetsItem: MenuItem = {
    label: 'My Card Sets',
    icon: 'pi pi-clone',
    command: () => navigateHandle('/card-sets'),
  };

  const globalCardSetsItem: MenuItem = {
    label: 'Card Library',
    icon: 'pi pi-globe',
    command: () => navigateHandle('/global-card-sets'),
  };

  const statisticsItem: MenuItem = {
    label: 'Statistics',
    icon: 'pi pi-chart-line',
    command: () => navigateHandle('/statistics'),
  };

  const studyModuleItem: MenuItem = {
    label: 'Create New Set',
    icon: 'pi pi-plus-circle',
    command: () => navigateHandle('/study-module'),
  };

  const profileItem: MenuItem = {
    label: 'Profile',
    icon: 'pi pi-user',
    command: () => navigateHandle('/profile'),
  };

  const loginItem: MenuItem = {
    label: 'Sign In',
    icon: 'pi pi-sign-in',
    command: () => navigateHandle('/login'),
  };

  const logoutItem: MenuItem = {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: logout,
  };

  // Return menu based on authentication status
  if (isAuthenticated) {
    return [
      homeItem,
      cardSetsItem,
      globalCardSetsItem,
      statisticsItem,
      studyModuleItem,
      profileItem,
      logoutItem,
    ];
  }

  return [homeItem, loginItem];
};
