import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTheme } from '../../hooks/useTheme';

const cardVariants = cva(
  "rounded-xl border bg-white dark:bg-surface-800",
  {
    variants: {
      variant: {
        default: "border-surface-200 dark:border-surface-700",
        ghost: "border-transparent shadow-none bg-transparent dark:bg-transparent",
        outline: "border-2 bg-transparent dark:bg-transparent",
        primary: "border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10",
      },
      hover: {
        true: "transition-all duration-200 hover:shadow-elevation-2 hover:-translate-y-0.5",
        false: "",
      },
      clickable: {
        true: "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        false: "",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        md: "shadow-elevation-1",
        lg: "shadow-elevation-2",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: false,
      clickable: false,
      shadow: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
  animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    variant,
    hover,
    clickable,
    shadow,
    as: Component = "div",
    animate = false,
    children,
    title,
    ...props 
  }, ref) => {
    const theme = useTheme();
    const Wrapper = animate ? motion.div : Component;
    
    return (
      <Wrapper
        ref={ref}
        className={cn(cardVariants({ variant, hover, clickable, shadow }), className, `${theme.cardBg} ${theme.borderColor} backdrop-blur-sm shadow-lg overflow-hidden`)}
        {...(animate && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 },
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        })}
        {...props}
      >
        {title && (
          <div className="p-4 border-b border-gray-200/20">
            <h3 className={`text-lg font-semibold ${theme.textColor}`}>{title}</h3>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </Wrapper>
    );
  }
);

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "text-surface-900 dark:text-surface-100",
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-surface-600 dark:text-surface-400",
      className
    )}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0",
      className
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};