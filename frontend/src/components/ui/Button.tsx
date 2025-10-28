import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";
import { useTheme } from '../../hooks/useTheme';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-surface-900 text-surface-50 hover:bg-surface-800 dark:bg-surface-50 dark:text-surface-900 dark:hover:bg-surface-200",
        primary:
          "bg-primary-500 text-white hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500",
        secondary:
          "bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700",
        outline:
          "border-2 border-surface-200 bg-transparent hover:bg-surface-100 dark:border-surface-700 dark:hover:bg-surface-800",
        ghost:
          "bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 dark:text-surface-50",
        link: "text-primary-500 underline-offset-4 hover:underline dark:text-primary-400",
        danger:
          "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "h-10 w-10 p-2",
      },
      fullWidth: {
        true: "w-full",
      },
      loading: {
        true: "cursor-wait",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean | undefined;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const theme = useTheme();
    
    const baseClasses = 'px-4 py-2 rounded-lg transition-colors duration-200';
    const variantClasses = variant === 'primary' ? theme.buttonPrimary : theme.buttonSecondary;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading }), className, `${baseClasses} ${variantClasses}`)}
        ref={ref}
        disabled={!!disabled || !!loading}

        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };