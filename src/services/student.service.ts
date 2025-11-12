import { httpCaller } from '../libs';

import type {
  IAdminCreateUserParams,
  IAdminCreateUserPayloadResponse,
  IAdminUpdateUserParams,
  IFindResultPayload,
  IGetUsersParams,
  IUser,
  IUserAwaitingInterviewItem,
  NewApiResponse,
} from '~/interfaces';

export class StudentService {
  static async findResult(
    studentCode: string
  ): Promise<NewApiResponse<IFindResultPayload>> {
    const response = await httpCaller.get(`/users/check-passed/${studentCode}`);

    return response.data as NewApiResponse<IFindResultPayload>;
  }

  static async getStudents(
    params: IGetUsersParams
  ): Promise<NewApiResponse<IUser[]>> {
    const response = await httpCaller.get('/users', {
      ...params,
    });

    return response.data as NewApiResponse<IUser[]>;
  }

  static async userCanTakeTest(): Promise<
    NewApiResponse<{ canTakeTest: boolean }>
  > {
    const response = await httpCaller.get(
      '/user-status/check-test-permission',
      {}
    );

    return response.data as NewApiResponse<{ canTakeTest: boolean }>;
  }

  static async getUsersAwaitingInterview(): Promise<
    NewApiResponse<IUserAwaitingInterviewItem[]>
  > {
    const response = await httpCaller.get('/mapping/users-awaiting-interview');
    return response.data as NewApiResponse<IUserAwaitingInterviewItem[]>;
  }

  static async getUserInfoById(id: string): Promise<NewApiResponse<IUser>> {
    const response = await httpCaller.post(`/users/${id}`, {});

    return response.data as NewApiResponse<IUser>;
  }

  static async getUserStatusStatistics(): Promise<
    NewApiResponse<{
      totalUsers: number;
      totalUsersWithTest: number;
      totalUsersWithInterview: number;
      statusCounts: { status: string; count: number }[];
    }>
  > {
    const response = await httpCaller.get('user-status/statistics', {});

    return response.data as NewApiResponse<{
      totalUsers: number;
      totalUsersWithTest: number;
      totalUsersWithInterview: number;
      statusCounts: { status: string; count: number }[];
    }>;
  }

  static async adminCreateUser(
    params: IAdminCreateUserParams
  ): Promise<NewApiResponse<IAdminCreateUserPayloadResponse>> {
    const response = await httpCaller.post('/users', {
      ...params,
    });

    return response.data as NewApiResponse<IAdminCreateUserPayloadResponse>;
  }

  static async adminUpdateUser(
    id: string,
    params: IAdminUpdateUserParams
  ): Promise<NewApiResponse<IUser>> {
    const response = await httpCaller.put(`/users/${id}`, {
      ...params,
    });

    return response.data as NewApiResponse<IUser>;
  }

  static async deleteStudent(id: string): Promise<NewApiResponse<boolean>> {
    const response = await httpCaller.delete(`/users/${id}`);

    return response.data as NewApiResponse<boolean>;
  }
}
