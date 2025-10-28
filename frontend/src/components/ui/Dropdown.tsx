import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as animations from '../../utils/animation';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  width?: string;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  width = '200px',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "cursor-pointer",
          isOpen && "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-surface-900 rounded-lg"
        )}
      >
        {typeof trigger === 'string' ? (
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
            {trigger}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        ) : (
          trigger
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={animations.scaleInOut}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "absolute z-50 mt-2 rounded-xl border border-surface-200 bg-white p-2",
              "dark:border-surface-700 dark:bg-surface-800 shadow-elevation-2",
              "min-w-[8rem] space-y-1",
              align === 'right' ? 'right-0' : 'left-0',
              className
            )}
            style={{ width }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  danger?: boolean;
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ className, children, icon, danger, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
          "hover:bg-surface-100 dark:hover:bg-surface-700",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          danger && "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10",
          className
        )}
        {...props}
      >
        {icon && <span className="h-4 w-4">{icon}</span>}
        {children}
      </button>
    );
  }
);

DropdownItem.displayName = "DropdownItem";

const DropdownSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("h-px bg-surface-200 dark:bg-surface-700 my-1", className)}
    {...props}
  />
));

DropdownSeparator.displayName = "DropdownSeparator";

export { Dropdown, DropdownItem, DropdownSeparator };