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
    path: '/study-module',
    name: 'study-module',
    component: () => import('../views/StudyModule/StudyModuleView.vue'),
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
      title: 'Học phần',
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
