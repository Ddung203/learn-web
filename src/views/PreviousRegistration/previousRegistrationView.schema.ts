import { z } from 'zod';

export const studentFormSchema = z.object({
  studentCode: z
    .string()
    .min(1, 'Mã sinh viên không được để trống')
    .regex(
      /^(202[1-9]|20[3-9]\d|2[1-9]\d{2})\d{6}$/,
      'Mã sinh viên không hợp lệ'
    ),
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  studentClass: z.string().min(1, 'Tên lớp không được để trống'),
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được để trống')
    .regex(/^(\+84|0)(3|5|7|8|9)\d{8}$/, 'Số điện thoại không hợp lệ'),
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  facebookLink: z.string().min(1, 'Link Facebook không được để trống'),
  avatarImage: z.string().min(1, 'Vui lòng chọn ảnh!'),
  hometown: z.string().min(1, 'Vui lòng chọn quê quán'),
});
