import { AxiosError } from 'axios';

export function buildErrorMessage(
  error: any,
  defaultMessage: string = 'Xảy ra lỗi chưa xác định'
): string {
  const errorMessage =
    error instanceof AxiosError
      ? error?.response?.data?.message
      : defaultMessage;

  return errorMessage;
}
