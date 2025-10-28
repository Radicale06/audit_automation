import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const inputVariants = cva(
  [
    "flex w-full rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-surface-500 dark:placeholder:text-surface-400",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ],
  {
    variants: {
      variant: {
        default: [
          "border-surface-200 dark:border-surface-700",
          "focus-visible:ring-primary-500 dark:focus-visible:ring-primary-400",
          "hover:border-primary-500 dark:hover:border-primary-400"
        ],
        error: [
          "border-red-500 dark:border-red-400",
          "focus-visible:ring-red-500 dark:focus-visible:ring-red-400",
          "text-red-600 dark:text-red-400",
          "placeholder:text-red-600 dark:placeholder:text-red-400"
        ],
        success: [
          "border-green-500 dark:border-green-400",
          "focus-visible:ring-green-500 dark:focus-visible:ring-green-400",
          "text-green-600 dark:text-green-400"
        ],
      },
      size: {
        default: "h-10",
        sm: "h-8 px-2 text-xs",
        lg: "h-12 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text",
    variant,
    size,
    startIcon,
    endIcon,
    error,
    success,
    disabled,
    ...props 
  }, ref) => {
    // Détermine la variante en fonction des props error et success
    const computedVariant = error ? "error" : success ? "success" : variant;

    return (
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant: computedVariant, size }),
            startIcon && "pl-10",
            endIcon && "pr-10",
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 dark:text-surface-400">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };