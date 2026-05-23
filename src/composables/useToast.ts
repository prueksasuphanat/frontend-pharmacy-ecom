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

export function useToast() {
  const toast = useToastification();

  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, options);
  };

  const warning = (message: string, options?: ToastOptions) => {
    return toast.warning(message, options);
  };

  const info = (message: string, options?: ToastOptions) => {
    return toast.info(message, options);
  };

  const show = (message: string, options?: ToastOptions) => {
    return toast(message, options);
  };

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
