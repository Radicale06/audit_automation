import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import { SkipLink } from '../components/ui';

interface BaseLayoutProps {
  children: React.ReactNode;
  mainClassName?: string;
  animate?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const BaseLayout = ({
  children,
  mainClassName,
  animate = true,
  header,
  footer
}: BaseLayoutProps) => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <SkipLink />
      
      <div className="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-900">
        {header}

        <main
          id="main-content"
          className={cn(
            "flex-1",
            mainClassName
          )}
          tabIndex={-1} // Pour permettre le focus via skipLink
        >
          {animate ? (
            <motion.div
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              {children}
            </motion.div>
          ) : (
            children
          )}
        </main>

        {footer}
      </div>
    </>
  );
};

export default BaseLayout;