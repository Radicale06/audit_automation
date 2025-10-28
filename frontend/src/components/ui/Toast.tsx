import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

const toastVariants = {
  success: 'bg-green-50 border-green-500 dark:bg-green-900/20',
  error: 'bg-red-50 border-red-500 dark:bg-red-900/20',
  warning: 'bg-amber-50 border-amber-500 dark:bg-amber-900/20',
  info: 'bg-blue-50 border-blue-500 dark:bg-blue-900/20',
};

const iconVariants = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const Toast = ({ 
  id, 
  title, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: ToastProps) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={cn(
        'glass-card border-l-4 p-4 min-w-[320px] pointer-events-auto',
        toastVariants[type]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {iconVariants[type]}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-surface-900 dark:text-white">
            {title}
          </h3>
          {message && (
            <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
              {message}
            </p>
          )}
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 ml-4 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-300"
        >
          <span className="sr-only">Fermer</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export interface ToastContainerProps {
  children: React.ReactNode;
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'fixed right-4 top-4 z-50',
        'flex flex-col items-end gap-2 sm:max-w-md',
        className
      )}
      aria-live="polite"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence mode="sync">
        {children}
      </AnimatePresence>
    </div>
  );
};

export { ToastContainer };