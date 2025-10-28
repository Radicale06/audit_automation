import { useState, useCallback } from 'react';
import { ToastProps } from '../components/ui/Toast';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ShowToastOptions {
  type?: ToastType;
  duration?: number;
}

export const useNotification = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = useCallback((
    title: string,
    message?: string,
    options: ShowToastOptions = {}
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastProps = {
      id,
      title,
      message,
      type: options.type || 'info',
      duration: options.duration,
      onClose: (toastId) => {
        setToasts((current) => current.filter((t) => t.id !== toastId));
      },
    };

    setToasts((current) => [...current, toast]);
    return id;
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    closeToast,
    clearToasts,
  };
};