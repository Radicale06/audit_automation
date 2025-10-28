import { ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@tremor/react';
import { cn } from '../../utils/cn';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
}

const LoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-white/50 dark:bg-navy-800/50 backdrop-blur-sm flex items-center justify-center z-10"
  >
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <span className="text-sm text-surface-600 dark:text-surface-400">
        Chargement...
      </span>
    </div>
  </motion.div>
);

export const ChartCard = ({
  title,
  children,
  action,
  className,
  fullWidth = false,
  loading = false,
}: ChartCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const entry = useIntersectionObserver(ref, { threshold: 0.1 });
  const isVisible = !!entry?.isIntersecting;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "chart-card relative",
        fullWidth ? "w-full" : "",
        className
      )}
    >
      <Card className="p-0 bg-transparent">
        <div className="chart-card-header">
          <motion.h3 
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="chart-title"
          >
            {title}
          </motion.h3>
          {action && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-2"
            >
              {action}
            </motion.div>
          )}
        </div>

        <div className={cn(
          "relative transition-opacity duration-200",
          loading ? "opacity-50" : "opacity-100"
        )}>
          <AnimatePresence mode="wait">
            {loading && <LoadingOverlay />}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};