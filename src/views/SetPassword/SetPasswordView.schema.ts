import { z } from 'zod';

export const setPasswordFormSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 8 ký tự'),
    // .regex(/(?=.*[a-z])/, 'Mật khẩu phải có ít nhất 1 ký tự thường')
    // .regex(/(?=.*[A-Z])/, 'Mật khẩu phải có ít nhất 1 ký tự hoa')
    // .regex(/(?=.*\d)/, 'Mật khẩu phải có ít nhất 1 chữ số')
    // .regex(/(?=.*[@$!%*?&])/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu không được để trống'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
