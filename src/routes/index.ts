import { createRouter, createWebHistory } from 'vue-router';
import { authGuard, redirectIfAuthenticated } from '~/guards/auth.guard';
import { ROLE } from '~/constants';
import type { AppRouteRecord } from '~/interfaces/route.interface';

const routes: AppRouteRecord[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/introduction',
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Home',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/LoginView.vue'),
    beforeEnter: redirectIfAuthenticated,
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Đăng nhập',
    },
  },

  {
    path: '/questions',
    name: 'questions',
    component: () => import('../views/Question/QuestionListView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER],
      layout: true,
      title: 'Danh sách câu hỏi',
    },
  },
  {
    path: '/introduction',
    name: 'introduction',
    component: () => import('../views/Introduction/IntroductionView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Giới thiệu',
    },
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: () => import('../views/Leaderboard/LeaderboardView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER],
      layout: true,
      title: 'Bảng xếp hạng',
    },
  },
  {
    path: '/interview',
    name: 'interview',
    component: () => import('../views/Interview/InterviewView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER],
      layout: true,
      title: 'Phỏng vấn',
    },
  },
  {
    path: '/students',
    name: 'students',
    component: () => import('../views/Student/StudentListView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER],
      layout: true,
      title: 'Danh sách sinh viên',
    },
  },
  {
    path: '/review',
    name: 'review',
    component: () => import('../views/Review/ReviewView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN],
      layout: true,
      title: 'Duyệt CTV',
    },
  },
  {
    path: '/stat',
    name: 'stat',
    component: () => import('../views/Stat/StatView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN],
      layout: true,
      title: 'Thống kê',
    },
  },
  {
    path: '/find-result',
    name: 'find-result',
    component: () => import('../views/FindResult/FindResultView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Tra cứu kết quả',
    },
  },
  {
    path: '/previous-registration',
    name: 'previous-registration',
    component: () =>
      import('../views/PreviousRegistration/PreviousRegistrationView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Đăng ký CTV',
    },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('../views/ForgotPassword/ForgotPasswordView.vue'),
    beforeEnter: redirectIfAuthenticated,
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Quên mật khẩu',
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('../views/ResetPassword/ResetPasswordView.vue'),
    beforeEnter: redirectIfAuthenticated,
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Đặt lại mật khẩu',
    },
  },
  {
    path: '/verify-otp',
    name: 'verify-otp',
    component: () => import('../views/VerifyOTP/VerifyOTPView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Xác thực OTP',
    },
  },
  {
    path: '/set-password',
    name: 'set-password',
    component: () => import('../views/SetPassword/SetPasswordView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Đặt mật khẩu',
    },
  },
  {
    path: '/start-test',
    name: 'start-test',
    component: () => import('../views/Exam/StartTestView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.USER],
      layout: true,
      title: 'Bắt đầu kiểm tra',
    },
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Exam/TestView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.USER],
      layout: true,
      title: 'Bài kiểm tra',
    },
  },
  {
    path: '/finish-test',
    name: 'finish-test',
    component: () => import('../views/Exam/EndTestView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.USER],
      layout: true,
      title: 'Kết thúc kiểm tra',
    },
  },

  {
    path: '/authenticator',
    name: 'authenticator',
    component: () => import('../views/AuthApp/AuthAppView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER],
      layout: true,
      title: 'Authenticator',
    },
  },

  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile/ProfileView.vue'),
    beforeEnter: authGuard,
    meta: {
      requiredAuth: true,
      requiredRole: [ROLE.ROOT, ROLE.ADMIN, ROLE.INTERVIEWER, ROLE.USER],
      layout: true,
      title: 'Thông tin cá nhân',
    },
  },

  {
    path: '/:catchAll(.*)',
    name: 'notFound',
    component: () => import('../views/NotFound/NotFoundView.vue'),
    meta: {
      requiredAuth: false,
      requiredRole: [
        ROLE.ROOT,
        ROLE.ADMIN,
        ROLE.INTERVIEWER,
        ROLE.USER,
        ROLE.OTHER,
      ],
      layout: true,
      title: 'Không tìm thấy trang',
    },
  },
];

const appRouter = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as any, // Type assertion to handle custom meta interface
});

// Global navigation guard
appRouter.beforeEach(authGuard);

export default appRouter;
