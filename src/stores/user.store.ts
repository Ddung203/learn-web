import { defineStore } from 'pinia';

import { STATUS_CODE } from '~/constants';
import type {
  IGetListResult,
  IUserFilters,
  IUser,
  NewApiResponse,
} from '~/interfaces';
import { UserService } from '~/services';
import { STORE_IDS } from './store-id';

export interface UserState {
  users: IUser[];
  selectedUser: IUser | null;
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: IUserFilters;
}

export const useUserStore = defineStore(STORE_IDS.USER, {
  state: (): UserState => ({
    users: [],
    selectedUser: null,
    loading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: {
      page: 1,
      limit: 10,
      search: '',
      studentCode: '',
      email: '',
      phoneNumber: '',
      role: undefined,
      accountStatus: undefined,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    },
  }),

  getters: {
    getUserById: (state) => (id: string) => {
      return state.users.find((user) => user._id === id);
    },

    hasUsers: (state): boolean => {
      return state.users.length > 0;
    },

    getCurrentFilters: (state): IUserFilters => {
      return state.filters;
    },

    getTotalPages: (state): number => {
      return state.pagination.totalPages;
    },

    getSelectedUser: (state): IUser | null => {
      return state.selectedUser;
    },
  },

  actions: {
    setLoading(loading: boolean): void {
      this.loading = loading;
    },

    setUsers(users: IUser[]): void {
      this.users = users;
    },

    setSelectedUser(user: IUser | null): void {
      this.selectedUser = user;
    },

    addUser(user: IUser): void {
      this.users.push(user);
    },

    removeUser(userId: string): void {
      this.users = this.users.filter((u) => u._id !== userId);
    },

    updateUser(updatedUser: IUser): void {
      const index = this.users.findIndex((u) => u._id === updatedUser._id);
      if (index !== -1) {
        this.users[index] = updatedUser;
      }
    },

    setFilters(filters: IUserFilters): void {
      this.filters = { ...this.filters, ...filters };
    },

    clearFilters(): void {
      this.filters = {
        page: 1,
        limit: 10,
        search: '',
        studentCode: '',
        email: '',
        phoneNumber: '',
        role: undefined,
        accountStatus: undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      };
    },

    setPagination(paginationData: IGetListResult<IUser>): void {
      this.pagination = {
        page: paginationData.page,
        limit: paginationData.perPage,
        total: paginationData.totalData,
        totalPages: paginationData.totalPages,
        hasNextPage: paginationData.hasNextPage,
        hasPrevPage: paginationData.hasPrevPage,
      };
    },

    async getUsersHandle(filters?: IUserFilters): Promise<void> {
      this.setLoading(true);

      const queryFilters = { ...this.filters, ...filters };

      const response: NewApiResponse<IGetListResult<IUser>> =
        await UserService.getUsers(queryFilters);

      if (response.status === STATUS_CODE.SUCCESS) {
        this.setUsers(response.payload.data);
        this.setPagination(response.payload);
        this.setFilters(queryFilters);
      }
    },
  },
});
