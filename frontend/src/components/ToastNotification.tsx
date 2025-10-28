import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface ToastNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
};

const colors = {
  success: 'bg-green-50 dark:bg-green-500/10 text-green-800 dark:text-green-300 border-green-200 dark:border-green-500/20',
  error: 'bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/20',
  info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/20',
  warning: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/20'
};

const iconColors = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400'
};

export default function ToastNotification({ message, type, onClose }: ToastNotificationProps) {
  const Icon = icons[type];

  const variants = {
    hidden: { 
      opacity: 0,
      x: 50,
      y: -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "rounded-lg p-4 shadow-elevation-2 border backdrop-blur-sm",
          "flex items-center justify-between gap-3",
          "max-w-md w-full",
          colors[type]
        )}
        role="alert"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={cn("h-5 w-5 flex-shrink-0", iconColors[type])} />
          <p className="text-sm font-medium break-words">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "p-1 rounded-md transition-colors",
            "hover:bg-black/5 dark:hover:bg-white/5",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            type === 'success' && "focus:ring-green-500",
            type === 'error' && "focus:ring-red-500",
            type === 'info' && "focus:ring-blue-500",
            type === 'warning' && "focus:ring-yellow-500"
          )}
          aria-label="Fermer la notification"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}