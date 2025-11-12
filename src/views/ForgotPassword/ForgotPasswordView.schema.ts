import { z } from 'zod';

export const forgotPasswordFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email là trường bắt buộc' })
    .email({ message: 'Email không hợp lệ' }),
});

export type IForgotPasswordFormData = z.infer<typeof forgotPasswordFormSchema>;
