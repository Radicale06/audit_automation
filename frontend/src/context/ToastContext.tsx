import { createContext, useContext } from 'react';
import { ToastContainer, Toast, ToastProps } from '../components/ui/Toast';
import { useNotification } from '../hooks/useNotification';

interface ToastContextType {
  showToast: (title: string, message?: string, options?: { type?: ToastProps['type']; duration?: number }) => string;
  closeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, showToast, closeToast, clearToasts } = useNotification();

  return (
    <ToastContext.Provider value={{ showToast, closeToast, clearToasts }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
