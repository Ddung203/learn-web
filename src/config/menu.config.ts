import { ROLE } from '~/constants';
import type { MenuConfig, MenuItem } from '~/interfaces/route.interface';

export const createMenuItems = (
  navigateHandle: (path: string) => void,
  logout: () => void
): MenuConfig => {
  // Base common items
  const homeItem: MenuItem = {
    label: 'IT SUPPORTER',
    icon: 'pi pi-home',
    command: () => navigateHandle('/introduction'),
  };

  const verifyOtpItem: MenuItem = {
    label: 'Xác thực OTP',
    icon: 'pi pi-verified',
    command: () => navigateHandle('/verify-otp'),
  };

  const profileItem: MenuItem = {
    label: 'Cá nhân',
    icon: 'pi pi-user-edit',
    command: () => navigateHandle('/profile'),
  };

  const logoutItem: MenuItem = {
    label: 'Đăng xuất',
    icon: 'pi pi-sign-out',
    command: logout,
  };

  const questionManagementItems: MenuItem[] = [
    {
      label: 'Danh sách câu hỏi',
      icon: 'pi pi-list',
      command: () => navigateHandle('/questions'),
    },
  ];

  const accountManagementItems: MenuItem[] = [
    {
      label: 'Sinh viên',
      icon: 'pi pi-user',
      command: () => navigateHandle('/students'),
    },

    {
      label: 'Authenticator',
      icon: 'pi pi-qrcode',
      command: () => navigateHandle('/authenticator'),
    },
  ];

  const postInterviewItems: MenuItem[] = [
    {
      label: 'Duyệt CTV',
      icon: 'pi pi-envelope',
      command: () => navigateHandle('/review'),
    },
  ];

  return {
    [ROLE.ROOT]: [
      homeItem,
      // verifyOtpItem,
      {
        label: 'Bảng xếp hạng',
        icon: 'pi pi-chart-bar',
        command: () => navigateHandle('/leaderboard'),
      },
      {
        label: 'Tài khoản',
        icon: 'pi pi-users',
        items: [
          ...accountManagementItems,
          // {
          //   label: 'ROOT Management',
          //   icon: 'pi pi-crown',
          //   command: () => navigateHandle('/root-management'),
          // },
        ],
      },
      {
        label: 'Câu hỏi',
        icon: 'pi pi-question-circle',
        items: questionManagementItems,
      },
      {
        label: 'Phỏng vấn',
        icon: 'pi pi-file-edit',
        command: () => navigateHandle('/interview'),
      },
      {
        label: 'Sau phỏng vấn',
        icon: 'pi pi-hourglass',
        items: postInterviewItems,
      },
      {
        label: 'Quản trị hệ thống',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Danh sách thống kê',
            icon: 'pi pi-sort',
            command: () => navigateHandle('/stat'),
          },
          // {
          //   label: 'Cấu hình hệ thống',
          //   icon: 'pi pi-wrench',
          //   command: () => navigateHandle('/system-config'),
          // },
          // {
          //   label: 'Logs hệ thống',
          //   icon: 'pi pi-file-o',
          //   command: () => navigateHandle('/system-logs'),
          // },
        ],
      },
      profileItem,
      logoutItem,
    ],

    [ROLE.OTHER]: [
      homeItem,
      verifyOtpItem,
      {
        label: 'Đăng ký CTV',
        icon: 'pi pi-send',
        command: () => navigateHandle('/previous-registration'),
      },
      {
        label: 'Tra cứu kết quả',
        icon: 'pi pi-search',
        command: () => navigateHandle('/find-result'),
      },
      {
        label: 'Đăng nhập',
        icon: 'pi pi-pencil',
        command: () => navigateHandle('/login'),
      },
    ],

    [ROLE.USER]: [
      homeItem,
      {
        label: 'Bài kiểm tra',
        icon: 'pi pi-pencil',
        command: () => navigateHandle('/start-test'),
      },
      {
        label: 'Tra cứu kết quả',
        icon: 'pi pi-search',
        command: () => navigateHandle('/find-result'),
      },
      profileItem,
      logoutItem,
    ],

    [ROLE.INTERVIEWER]: [
      homeItem,
      {
        label: 'Bảng xếp hạng',
        icon: 'pi pi-chart-bar',
        command: () => navigateHandle('/leaderboard'),
      },
      {
        label: 'Tài khoản',
        icon: 'pi pi-users',
        items: accountManagementItems,
      },
      {
        label: 'Câu hỏi',
        icon: 'pi pi-question-circle',
        items: questionManagementItems,
      },
      {
        label: 'Phỏng vấn',
        icon: 'pi pi-file-edit',
        command: () => navigateHandle('/interview'),
      },
      profileItem,
      logoutItem,
    ],

    [ROLE.ADMIN]: [
      homeItem,
      {
        label: 'Bảng xếp hạng',
        icon: 'pi pi-chart-bar',
        command: () => navigateHandle('/leaderboard'),
      },
      {
        label: 'Tài khoản',
        icon: 'pi pi-users',
        items: accountManagementItems,
      },
      {
        label: 'Câu hỏi',
        icon: 'pi pi-question-circle',
        items: questionManagementItems,
      },
      {
        label: 'Phỏng vấn',
        icon: 'pi pi-file-edit',
        command: () => navigateHandle('/interview'),
      },
      {
        label: 'Sau phỏng vấn',
        icon: 'pi pi-hourglass',
        items: postInterviewItems,
      },
      {
        label: 'Danh sách thống kê',
        icon: 'pi pi-sort',
        command: () => navigateHandle('/stat'),
      },
      profileItem,
      logoutItem,
    ],
  };
};
