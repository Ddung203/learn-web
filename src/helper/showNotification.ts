export type Severity = 'success' | 'error' | 'info' | 'warn';

export interface NotificationOptions {
  severity: Severity;
  summary: string;
  detail: string;
  life?: number;
}

export const showNotification = (
  toast: any,
  { severity, summary, detail, life = 2000 }: NotificationOptions
) => {
  toast.add({
    severity,
    summary,
    detail,
    life,
  });
};

export const notifySuccess = (toast: any, detail: string, life = 2000) => {
  showNotification(toast, {
    severity: 'success',
    summary: 'Thông báo',
    detail,
    life,
  });
};

export const notifyError = (toast: any, detail: string, life = 3000) => {
  showNotification(toast, {
    severity: 'error',
    summary: 'Thông báo lỗi',
    detail: detail || 'Đã có lỗi xảy ra, vui lòng thử lại!',
    life,
  });
};

export const notifyInfo = (toast: any, detail: string, life = 3000) => {
  showNotification(toast, {
    severity: 'info',
    summary: 'Thông báo',
    detail,
    life,
  });
};
