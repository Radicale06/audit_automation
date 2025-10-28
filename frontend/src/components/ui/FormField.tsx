import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ 
    children, 
    className, 
    label, 
    error, 
    required, 
    optional,
    description,
    htmlFor,
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <div className="flex items-center justify-between">
            <label 
              htmlFor={htmlFor}
              className="block text-sm font-medium text-surface-900 dark:text-surface-100"
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500" aria-hidden="true">*</span>
              )}
              {optional && (
                <span className="ml-2 text-sm text-surface-500 dark:text-surface-400">
                  (Optionnel)
                </span>
              )}
            </label>
          </div>
        )}
        
        {description && (
          <p className="text-sm text-surface-500 dark:text-surface-400">
            {description}
          </p>
        )}

        {children}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 text-sm text-red-500 dark:text-red-400"
            >
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };