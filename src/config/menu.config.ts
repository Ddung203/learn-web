import { ROLE } from '~/constants';
import type { MenuConfig, MenuItem } from '~/interfaces/route.interface';

export const createMenuItems = (
  navigateHandle: (path: string) => void,
  logout: () => void
): MenuConfig => {
  // Base common items
  const homeItem: MenuItem = {
    label: 'ChocoLearn',
    icon: 'pi pi-home',
    command: () => navigateHandle('/introduction'),
  };

  const studyModuleItem: MenuItem = {
    label: 'Create new set',
    icon: 'pi pi-verified',
    command: () => navigateHandle('/study-module'),
  };

  const profileItem: MenuItem = {
    label: 'Cá nhân',
    icon: 'pi pi-user-edit',
    command: () => navigateHandle('/profile'),
  };

  const logoutItem: MenuItem = {
    label: 'Sign Out',
    icon: 'pi pi-sign-out',
    command: logout,
  };

  return {
    [ROLE.ROOT]: [homeItem, profileItem, logoutItem],

    [ROLE.OTHER]: [
      homeItem,
      studyModuleItem,
      {
        label: 'Sign In',
        icon: 'pi pi-pencil',
        command: () => navigateHandle('/login'),
      },
    ],

    [ROLE.USER]: [homeItem, profileItem, logoutItem],

    [ROLE.INTERVIEWER]: [homeItem, profileItem, logoutItem],

    [ROLE.ADMIN]: [homeItem, profileItem, logoutItem],
  };
};
