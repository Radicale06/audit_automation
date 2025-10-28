import React from 'react';
import { cn } from '../../utils/cn';

interface SkipLinkProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
}

const SkipLink = ({
  href = "#main-content",
  className,
  children = "Aller au contenu principal"
}: SkipLinkProps) => {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-4 focus:left-4",
        "px-4 py-2 bg-primary-500 text-white rounded-lg shadow-elevation-2",
        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        "transition-transform hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </a>
  );
};

export { SkipLink };