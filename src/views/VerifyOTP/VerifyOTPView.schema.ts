import { z } from 'zod';

export const verifyOTPFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  otpCode: z
    .string()
    // .regex(/^\d+$/, {
    //   message: 'Mã OTP chỉ bao gồm các chữ số',
    // })
    .min(1, 'Mã OTP không được để trống')
    .length(6, 'Mã OTP phải có đúng 6 ký tự'),
});

export const resendOTPFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
});
