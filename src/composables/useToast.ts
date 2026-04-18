import { useToast as useToastification } from "vue-toastification";

export interface ToastOptions {
  timeout?: number;
  closeOnClick?: boolean;
  pauseOnFocusLoss?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  showCloseButtonOnHover?: boolean;
  hideProgressBar?: boolean;
  icon?: boolean | string;
}

/**
 * Composable สำหรับแสดง toast notifications
 * ใช้ vue-toastification ภายใน
 */
export function useToast() {
  const toast = useToastification();

  /**
   * แสดง toast แบบ success
   */
  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, options);
  };

  /**
   * แสดง toast แบบ error
   */
  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, options);
  };

  /**
   * แสดง toast แบบ warning
   */
  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, options);
  };

  /**
   * แสดง toast แบบ info
   */
  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, options);
  };

  /**
   * แสดง toast แบบ default
   */
  const show = (message: string, options?: ToastOptions) => {
    return toast(message, options);
  };

  /**
   * ปิด toast ทั้งหมด
   */
  const clear = () => {
    toast.clear();
  };

  return {
    success,
    error,
    warning,
    info,
    show,
    clear,
  };
}
