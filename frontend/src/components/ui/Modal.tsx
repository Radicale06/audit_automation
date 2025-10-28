// Modal.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as animations from '../../utils/animation';
import useMediaQuery from '../../hooks/useMediaQuery';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  closeOnClickOutside?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  className,
  showCloseButton = true,
  closeOnClickOutside = true,
  size = 'md',
  position = 'center'
}) => {
  const reducedMotion = useMediaQuery('motion-reduce');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  const positionClasses = {
    center: 'items-center',
    top: 'items-start pt-20'
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={cn(
              "fixed inset-0 bg-surface-900/50 backdrop-blur-sm",
              "flex justify-center",
              positionClasses[position]
            )}
            onClick={closeOnClickOutside ? onClose : undefined}
          >
            <motion.div
              variants={animations.modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={cn(
                "relative w-full m-4",
                "bg-white dark:bg-surface-800",
                "border border-surface-200 dark:border-surface-700",
                "rounded-xl shadow-elevation-3",
                sizeClasses[size],
                className
              )}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? "modal-title" : undefined}
              aria-describedby={description ? "modal-description" : undefined}
            >
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    "absolute right-4 top-4 rounded-lg p-1",
                    "text-surface-500 hover:text-surface-900",
                    "dark:text-surface-400 dark:hover:text-surface-100",
                    "hover:bg-surface-100 dark:hover:bg-surface-700",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500"
                  )}
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              <div className="p-6">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2"
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <p
                    id="modal-description"
                    className="text-surface-600 dark:text-surface-400 mb-4"
                  >
                    {description}
                  </p>
                )}

                {children}
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal; // Default export
