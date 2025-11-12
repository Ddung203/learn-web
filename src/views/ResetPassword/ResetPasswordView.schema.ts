import { z } from 'zod';

export const resetPasswordFormSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: 'Email là trường bắt buộc' })
      .email({ message: 'Email không hợp lệ' }),
    otpCode: z
      .string()
      .min(6, { message: 'Mã OTP phải có đúng 6 chữ số' })
      .max(6, { message: 'Mã OTP phải có đúng 6 chữ số' })
      .regex(/^\d+$/, { message: 'Mã OTP chỉ được chứa số' }),
    newPassword: z
      .string()
      .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    // newPassword: z
    //   .string()
    //   .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    //   .regex(/[a-z]/, { message: 'Mật khẩu phải có ít nhất 1 chữ thường' })
    //   .regex(/[A-Z]/, { message: 'Mật khẩu phải có ít nhất 1 chữ hoa' })
    //   .regex(/\d/, { message: 'Mật khẩu phải có ít nhất 1 chữ số' })
    //   .regex(/[@$!%*?&]/, {
    //     message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)',
    //   }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Xác nhận mật khẩu là bắt buộc' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type IResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;
