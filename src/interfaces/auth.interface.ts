export interface ILoginParams {
  username: string;
  password: string;
}

export interface ILoginPayloadResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterPayload {
  username: string;
  fullName: string;
  studentCode: string;
  studentClass: string;
  phoneNumber: string;
  email: string;
  hometown: string;
  avatarImage: string;
  facebookLink: string;
}

export interface IVerifyOTPPayload {
  email: string;
  otpCode: string;
}

export interface ISetPasswordPayload {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IResendOTPPayload {
  email: string;
}
