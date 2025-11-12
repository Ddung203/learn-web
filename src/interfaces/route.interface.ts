import type { RoleValue } from '~/constants';
import type { RouteRecordRaw } from 'vue-router';

export interface RouteMeta {
  requiredAuth: boolean;
  requiredRole: RoleValue[];
  layout?: boolean;
  title?: string;
  requiresEmailVerification?: boolean;
}

export interface AppRouteRecord extends Omit<RouteRecordRaw, 'meta'> {
  meta?: RouteMeta;
}

export interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  command?: () => void;
  items?: MenuItem[];
  visible?: boolean;
}

export interface MenuConfig {
  [key: string]: MenuItem[];
}
