import { httpCaller } from '../libs';
import type {
  NewApiResponse,
  IGetListResult,
  IUser,
  IUserFilters,
  IAdminCreateUserParams,
  IAdminCreateUserPayloadResponse,
  IAdminUpdateUserParams,
  IFindResultPayload,
  IUserAwaitingInterviewItem,
  IUserMapping,
} from '~/interfaces';

export class UserService {
  static async getUsers(
    filters?: IUserFilters
  ): Promise<NewApiResponse<IGetListResult<IUser>>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.search) {
        // Search trong field fullName (có thể customize theo backend API)
        params.append('fullName', filters.search);
      }
      if (filters.studentCode) {
        params.append('studentCode', filters.studentCode);
      }
      if (filters.email) {
        params.append('email', filters.email);
      }
      if (filters.phoneNumber) {
        params.append('phoneNumber', filters.phoneNumber);
      }
      if (filters.accountStatus)
        params.append('accountStatus', filters.accountStatus);
      if (filters.role) params.append('role', filters.role);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.fields) params.append('fields', filters.fields);
    }

    // Default values
    if (!filters?.page) params.append('page', '1');
    if (!filters?.limit) params.append('limit', '10');

    const queryString = params.toString();
    const url = `/users${queryString ? `?${queryString}` : ''}`;

    const response = await httpCaller.get(url);
    return response.data as NewApiResponse<IGetListResult<IUser>>;
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getUserById(userId: string): Promise<NewApiResponse<IUser>> {
    const response = await httpCaller.get(`/users/${userId}`);
    return response.data as NewApiResponse<IUser>;
  }

  /**
   * Tạo user mới (Admin only)
   */
  static async createUser(
    userData: IAdminCreateUserParams
  ): Promise<NewApiResponse<IAdminCreateUserPayloadResponse>> {
    const response = await httpCaller.post('/users', userData);
    return response.data as NewApiResponse<IAdminCreateUserPayloadResponse>;
  }

  /**
   * Cập nhật user (PUT - full update)
   */
  static async updateUser(
    userId: string,
    userData: IAdminUpdateUserParams
  ): Promise<NewApiResponse<IUser>> {
    const response = await httpCaller.put(`/users/${userId}`, userData);
    return response.data as NewApiResponse<IUser>;
  }

  /**
   * Cập nhật user (PATCH - partial update)
   */
  static async updateUserPatch(
    userId: string,
    userData: Partial<IAdminUpdateUserParams>
  ): Promise<NewApiResponse<IUser>> {
    const response = await httpCaller.patch(`/users/${userId}`, userData);
    return response.data as NewApiResponse<IUser>;
  }

  /**
   * Xóa user
   */
  static async deleteUser(userId: string): Promise<NewApiResponse<void>> {
    const response = await httpCaller.delete(`/users/${userId}`);
    return response.data as NewApiResponse<void>;
  }

  /**
   * Lấy thống kê user active
   */
  static async getUserActiveStats(): Promise<
    NewApiResponse<{
      totalUsers: number;
      totalUsersWithTest: number;
      totalUsersWithInterview: number;
      statusCounts: { status: string; count: number }[];
    }>
  > {
    const response = await httpCaller.get('/users/active-stats');
    return response.data as NewApiResponse<{
      totalUsers: number;
      totalUsersWithTest: number;
      totalUsersWithInterview: number;
      statusCounts: { status: string; count: number }[];
    }>;
  }

  /**
   * Kiểm tra user có đậu hay không (Public API)
   */
  static async checkUserPassed(
    studentCode: string
  ): Promise<NewApiResponse<IFindResultPayload>> {
    const response = await httpCaller.get(`/users/check-passed/${studentCode}`);
    return response.data as NewApiResponse<IFindResultPayload>;
  }

  /**
   * Lấy danh sách users đang chờ phỏng vấn
   */
  static async getUsersAwaitingInterview(): Promise<
    NewApiResponse<IUserAwaitingInterviewItem[]>
  > {
    const response = await httpCaller.get('/mapping/users-awaiting-interview');
    return response.data as NewApiResponse<IUserAwaitingInterviewItem[]>;
  }

  static async getUsersMapping(): Promise<NewApiResponse<IUserMapping[]>> {
    const response = await httpCaller.get('/mapping/users');
    return response.data as NewApiResponse<IUserMapping[]>;
  }
}
