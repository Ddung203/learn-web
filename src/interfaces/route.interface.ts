import type { RouteRecordRaw } from 'vue-router';

export interface RouteMeta {
  requiredAuth: boolean;
  layout?: boolean;
  title?: string;
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
