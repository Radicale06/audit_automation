import React, { useState } from 'react';
import { AlertTriangle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <motion.div 
          className={cn(
            "bg-white dark:bg-surface-800 rounded-xl p-6 max-w-sm w-full mx-4",
            "border border-surface-200 dark:border-surface-700",
            "shadow-elevation-3"
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={e => e.stopPropagation()}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex items-center justify-center text-red-500 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-500/10 rounded-full">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>

          <h2 
            id="modal-title"
            className="text-xl font-semibold text-surface-900 dark:text-surface-100 text-center mb-2"
          >
            Confirmation de déconnexion
          </h2>

          <p className="text-surface-600 dark:text-surface-400 text-center mb-6">
            Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className={cn(
                "btn-secondary flex-1",
                "focus:ring-surface-500"
              )}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className={cn(
                "btn-primary flex-1",
                "bg-red-500 hover:bg-red-600 focus:ring-red-500",
                "inline-flex items-center justify-center"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                'Se déconnecter'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LogoutModal;