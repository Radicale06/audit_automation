import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

const colorVariants = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
};

export const StatsCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  description,
  color = 'blue' 
}: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl bg-white dark:bg-navy-800 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className={cn(
            "inline-flex p-3 rounded-lg",
            colorVariants[color]
          )}>
            {icon}
          </div>
          <h3 className="text-base font-medium text-surface-600 dark:text-surface-400">
            {title}
          </h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-surface-900 dark:text-white">
              {value}
            </span>
            {change && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "inline-flex items-center text-sm font-medium",
                  trendColors[change.trend]
                )}
              >
                {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
              </motion.span>
            )}
          </div>
          {description && (
            <p className="text-sm text-surface-500 dark:text-surface-400">
              {description}
            </p>
          )}
        </div>
        
        <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-4 translate-y-4">
          <div className="text-[100px]">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};