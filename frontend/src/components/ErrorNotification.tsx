import React, { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface ErrorProps {
  message: string;
  code?: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'ERROR';
  field?: string;
}

interface ErrorNotificationProps {
  error: ErrorProps;
  onDismiss?: () => void;
  showIcon?: boolean;
  className?: string;
  autoHideDuration?: number;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  showIcon = true,
  className,
  autoHideDuration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration && onDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Attendre la fin de l'animation
      }, autoHideDuration);
      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onDismiss]);

  const getIcon = () => {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'UNAUTHORIZED':
      case 'FORBIDDEN':
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
    }
  };

  const getStyles = () => {
    const baseStyles = {
      background: {
        VALIDATION_ERROR: 'bg-yellow-50 dark:bg-yellow-500/10',
        UNAUTHORIZED: 'bg-blue-50 dark:bg-blue-500/10',
        FORBIDDEN: 'bg-blue-50 dark:bg-blue-500/10',
        ERROR: 'bg-red-50 dark:bg-red-500/10'
      },
      border: {
        VALIDATION_ERROR: 'border-yellow-200 dark:border-yellow-500/20',
        UNAUTHORIZED: 'border-blue-200 dark:border-blue-500/20',
        FORBIDDEN: 'border-blue-200 dark:border-blue-500/20',
        ERROR: 'border-red-200 dark:border-red-500/20'
      },
      text: {
        VALIDATION_ERROR: 'text-yellow-800 dark:text-yellow-300',
        UNAUTHORIZED: 'text-blue-800 dark:text-blue-300',
        FORBIDDEN: 'text-blue-800 dark:text-blue-300',
        ERROR: 'text-red-800 dark:text-red-300'
      }
    };

    const code = error.code || 'ERROR';
    return {
      background: baseStyles.background[code],
      border: baseStyles.border[code],
      text: baseStyles.text[code]
    };
  };

  const styles = getStyles();
  
  const variants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -10
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "rounded-lg border p-4 shadow-elevation-1 backdrop-blur-sm",
            styles.background,
            styles.border,
            className
          )}
          role="alert"
        >
          <div className="flex items-start gap-3">
            {showIcon && getIcon()}
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", styles.text)}>
                {error.message}
              </p>
              {error.field && (
                <p className={cn("mt-1 text-xs opacity-75", styles.text)}>
                  Champ: {error.field}
                </p>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  "hover:bg-black/5 dark:hover:bg-white/5",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1",
                  error.code === 'VALIDATION_ERROR' && "focus:ring-yellow-500",
                  error.code === 'UNAUTHORIZED' && "focus:ring-blue-500",
                  error.code === 'FORBIDDEN' && "focus:ring-blue-500",
                  (!error.code || error.code === 'ERROR') && "focus:ring-red-500"
                )}
                aria-label="Fermer la notification d'erreur"
              >
                <X className={cn("h-4 w-4", styles.text)} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorNotification;