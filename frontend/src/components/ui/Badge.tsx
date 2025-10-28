import { cn } from '../../utils/cn';
import { VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-surface-100 text-surface-900 hover:bg-surface-200/80 dark:bg-surface-800 dark:text-surface-100 dark:hover:bg-surface-700",
        primary:
          "bg-primary-50 text-primary-900 hover:bg-primary-100/80 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20",
        success:
          "bg-green-50 text-green-900 hover:bg-green-100/80 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20",
        warning:
          "bg-yellow-50 text-yellow-900 hover:bg-yellow-100/80 dark:bg-yellow-500/10 dark:text-yellow-300 dark:hover:bg-yellow-500/20",
        danger:
          "bg-red-50 text-red-900 hover:bg-red-100/80 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20",
        info:
          "bg-blue-50 text-blue-900 hover:bg-blue-100/80 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-xs px-2 py-0.5",
        lg: "text-sm px-3 py-1",
      },
      interactive: {
        true: "cursor-pointer",
        false: "cursor-default",
      },
      removable: {
        true: "pr-1.5",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
      removable: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  onRemove?: () => void;
}

const Badge = ({
  className,
  variant,
  size,
  interactive,
  removable,
  onRemove,
  children,
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, interactive, removable }),
        className
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className={cn(
            "ml-1 rounded-full p-0.5",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "focus:outline-none focus:ring-2 focus:ring-offset-1",
            variant === "primary" && "focus:ring-primary-500",
            variant === "success" && "focus:ring-green-500",
            variant === "warning" && "focus:ring-yellow-500",
            variant === "danger" && "focus:ring-red-500",
            variant === "info" && "focus:ring-blue-500"
          )}
          aria-label="Supprimer"
        >
          <svg
            className="h-3 w-3 opacity-50 hover:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export { Badge, badgeVariants };