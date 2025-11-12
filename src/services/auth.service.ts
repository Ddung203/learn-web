import type {
  ICommonPayloadResponse,
  ILoginParams,
  ILoginPayloadResponse,
  IRegisterPayload,
  IResendOTPPayload,
  ISetPasswordPayload,
  IUser,
  IVerifyOTPPayload,
  NewApiResponse,
} from '~/interfaces';
import { httpCaller } from '../libs';

export class AuthService {
  static async login(params: ILoginParams) {
    const response = await httpCaller.post('/auth/login', params);

    return response.data as NewApiResponse<ILoginPayloadResponse>;
  }

  static async getProfile() {
    const response = await httpCaller.get('/auth/profile');

    return response.data as NewApiResponse<IUser>;
  }

  static async register(
    payload: IRegisterPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/register', { ...payload });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async verifyOTP(
    payload: IVerifyOTPPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/verify-otp', { ...payload });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async setPassword(
    payload: ISetPasswordPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/set-password', {
      ...payload,
    });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async resendOTP(
    payload: IResendOTPPayload
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/resend-otp', { ...payload });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  //
  static async forgotPassword(
    email: string
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/forgot-password', { email });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }

  static async resetPassword(
    email: string,
    otpCode: string,
    newPassword: string
  ): Promise<NewApiResponse<ICommonPayloadResponse>> {
    const response = await httpCaller.post('/auth/reset-password', {
      email,
      otpCode,
      newPassword,
    });

    return response.data as NewApiResponse<ICommonPayloadResponse>;
  }
}
