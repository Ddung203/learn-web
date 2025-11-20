import type { MenuItem } from '~/interfaces/route.interface';

export const createMenuItems = (
  navigateHandle: (path: string) => void,
  logout: () => void,
  isAuthenticated: boolean,
  t: (key: string) => string
): MenuItem[] => {
  // Base common items
  const homeItem: MenuItem = {
    label: t('navbar.home'),
    icon: 'pi pi-home',
    command: () => navigateHandle('/introduction'),
  };

  const guideItem: MenuItem = {
    label: t('navbar.guide'),
    icon: 'pi pi-question-circle',
    command: () => navigateHandle('/guide'),
  };

  const cardSetsItem: MenuItem = {
    label: t('navbar.myCardSets'),
    icon: 'pi pi-clone',
    command: () => navigateHandle('/card-sets'),
  };

  const globalCardSetsItem: MenuItem = {
    label: t('navbar.cardLibrary'),
    icon: 'pi pi-globe',
    command: () => navigateHandle('/global-card-sets'),
  };

  const statisticsItem: MenuItem = {
    label: t('navbar.statistics'),
    icon: 'pi pi-chart-line',
    command: () => navigateHandle('/statistics'),
  };

  const studyModuleItem: MenuItem = {
    label: t('navbar.createNewSet'),
    icon: 'pi pi-plus-circle',
    command: () => navigateHandle('/study-module'),
  };

  const profileItem: MenuItem = {
    label: t('navbar.profile'),
    icon: 'pi pi-user',
    command: () => navigateHandle('/profile'),
  };

  const loginItem: MenuItem = {
    label: t('navbar.signIn'),
    icon: 'pi pi-sign-in',
    command: () => navigateHandle('/login'),
  };

  const logoutItem: MenuItem = {
    label: t('navbar.signOut'),
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
      guideItem,
      logoutItem,
    ];
  }

  return [homeItem, guideItem, loginItem];
};
