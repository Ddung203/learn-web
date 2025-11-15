import { createRouter, createWebHistory } from 'vue-router';
import type { AppRouteRecord } from '~/interfaces/route.interface';
import { authGuard } from '~/guards/auth.guard';

const routes: AppRouteRecord[] = [
  {
    path: '/',
    name: 'home',
    redirect: '/introduction',
    meta: {
      requiredAuth: false,
      layout: true,
      title: 'Home',
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login/LoginView.vue'),
    meta: {
      requiredAuth: false,
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
      layout: true,
      title: 'Giới thiệu',
    },
  },
  {
    path: '/study-module',
    name: 'study-module',
    component: () => import('../views/StudyModule/StudyModuleView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Học phần',
    },
  },
  {
    path: '/card-sets',
    name: 'card-sets',
    component: () => import('../views/CardSets/CardSetsView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Bộ thẻ học tập',
    },
  },
  {
    path: '/global-card-sets',
    name: 'global-card-sets',
    component: () => import('../views/CardSets/GlobalCardSetsView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Thư viện bộ thẻ',
    },
  },
  {
    path: '/card-sets/:id',
    name: 'card-set-detail',
    component: () => import('../views/CardSets/CardSetDetailView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Chi tiết bộ thẻ',
    },
  },
  {
    path: '/import-shared',
    name: 'import-shared',
    component: () => import('../views/CardSets/ImportSharedView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Nhập bộ thẻ từ link chia sẻ',
    },
  },
  {
    path: '/card-sets/:id/flashcards',
    name: 'study-flashcards',
    component: () => import('../views/StudyModes/FlashcardsView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Flashcards',
    },
  },
  {
    path: '/card-sets/:id/test',
    name: 'study-test',
    component: () => import('../views/StudyModes/TestView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Test',
    },
  },
  {
    path: '/card-sets/:id/write',
    name: 'study-write',
    component: () => import('../views/StudyModes/WriteView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Write',
    },
  },
  {
    path: '/card-sets/:id/learn',
    name: 'study-learn',
    component: () => import('../views/StudyModes/LearnView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Learn',
    },
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('../views/Statistics/StatisticsView.vue'),
    meta: {
      requiredAuth: true,
      layout: true,
      title: 'Thống kê',
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile/ProfileView.vue'),
    meta: {
      requiredAuth: true,
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
      layout: true,
      title: 'Không tìm thấy trang',
    },
  },
];

const appRouter = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as any,
});

appRouter.beforeEach(authGuard);

export default appRouter;
