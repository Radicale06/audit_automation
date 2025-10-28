import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-primary-500",
        white: "text-white",
        surface: "text-surface-500 dark:text-surface-400",
      },
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof loadingVariants> {
  label?: string;
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, label, ...props }, ref) => {
    const spinTransition = {
      repeat: Infinity,
      ease: "linear",
      duration: 1
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label || "Chargement"}
        className={cn("inline-flex flex-col items-center gap-3", className)}
        {...props}
      >
        <div className={cn(loadingVariants({ variant, size }))}>
          <motion.span
            className="absolute h-full w-full"
            style={{ borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent" }}
            animate={{ rotate: 360 }}
            transition={spinTransition}
          />
          <motion.span
            className="absolute h-full w-full"
            style={{ borderRadius: "50%", border: "2px dashed currentColor", borderBottomColor: "transparent" }}
            animate={{ rotate: -360 }}
            transition={spinTransition}
          />
        </div>
        {label && (
          <p className="text-sm text-surface-600 dark:text-surface-400">
            {label}
          </p>
        )}
      </div>
    );
  }
);

Loading.displayName = "Loading";

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant = "white", size = "lg", label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50",
          "flex items-center justify-center",
          "bg-surface-900/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <Loading variant={variant} size={size} label={label} />
      </div>
    );
  }
);

LoadingOverlay.displayName = "LoadingOverlay";

const LoadingDots = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, ...props }, ref) => {
    const dotVariants = {
      initial: { y: 0 },
      animate: { y: -4 }
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Chargement"
        className={cn(
          "inline-flex items-center space-x-1",
          loadingVariants({ variant, size }),
          className
        )}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-current"
            initial="initial"
            animate="animate"
            variants={dotVariants}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 0.4,
              delay: i * 0.1
            }}
          />
        ))}
      </div>
    );
  }
);

LoadingDots.displayName = "LoadingDots";

export { Loading, LoadingOverlay, LoadingDots };