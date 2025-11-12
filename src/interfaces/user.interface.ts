import type { RoleValue } from '~/constants';

export interface IUser {
  _id: string;
  username: string;
  fullName: string;
  studentCode: string;
  studentClass: string;
  phoneNumber: string;
  hometown: string;
  email: string;
  emailVerified: 0 | 1;
  accountStatus: 'pending' | 'active' | 'inactive' | string;
  avatarImage: string;
  facebookLink: string;
  role: RoleValue;
  isActive: 0 | 1;
  lastLoginAt: string;
  testScore?: string;
  finalScore?: string;

  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface IGetUsersParams {
  username?: string;
  studentCode?: string;
  email?: string;
  studentClass?: string;
  phoneNumber?: string;
  fullName?: string;
  accountStatus?: 'pending' | 'active' | 'inactive' | string;
  includeAll?: boolean;
  isActive?: 0 | 1;
  fields?: string;
  page?: number;
  limit?: number;
}

export interface IFindResultPayload {
  isPassed: boolean;
}

//
export interface IAdminCreateUserParams {
  username: string;
  fullName: string;
  studentCode: string;
  studentClass: string;
  phoneNumber: string;
  email: string;
  facebookLink: string;
  hometown: string;
  avatarImage: string;
  role: RoleValue;
  isActive: 0 | 1;
}

export interface IAdminCreateUserPayloadResponse {
  user: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    role: string;
    accountStatus: string;
  };
  otpSent: boolean;
  message: string;
}

//
export interface IAdminUpdateUserParams {
  username?: string;
  fullName?: string;
  password?: string;
  studentCode?: string;
  studentClass?: string;
  phoneNumber?: string;
  hometown?: string;
  email?: string;
  avatarImage?: string;
  facebookLink?: string;
}

//
export interface IUserAwaitingInterviewItem {
  id: string;

  fullName: string;
}

//
export interface IUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  studentCode?: string;
  phoneNumber?: string;
  email?: string;
  accountStatus?: 'pending' | 'active' | 'inactive' | 'expired' | string;
  role?: RoleValue;
  sortBy?: string;
  fields?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IUserMapping {
  id: string;
  fullName: string;
  studentCode: string;
  avatarImage: string;
}
