import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface FilterBarProps {
  onFilterChange: (filters: {
    dateRange: string;
    category: string;
    status: string;
  }) => void;
  isLoading?: boolean;
}

const shimmerAnimation = {
  initial: { backgroundPosition: "-200%" },
  animate: { 
    backgroundPosition: "200%",
    transition: { 
      repeat: Infinity, 
      duration: 2,
      ease: "linear"
    }
  }
};

const dateRanges = [
  { label: '7 jours', value: '7d' },
  { label: '30 jours', value: '30d' },
  { label: '90 jours', value: '90d' },
  { label: 'Cette année', value: 'year' },
];

const categories = [
  { label: 'Tous', value: 'all' },
  { label: 'Questions', value: 'questions' },
  { label: 'Support', value: 'support' },
  { label: 'Demandes', value: 'requests' },
];

const statuses = [
  { label: 'Tous', value: 'all' },
  { label: 'En cours', value: 'active' },
  { label: 'Résolu', value: 'resolved' },
  { label: 'En attente', value: 'pending' },
];

export const FilterBar = ({ onFilterChange, isLoading = false }: FilterBarProps) => {
  const { isDark } = useTheme();
  const [activeFilters, setActiveFilters] = useState({
    dateRange: '30d',
    category: 'all',
    status: 'all',
  });

  const handleFilterClick = (type: keyof typeof activeFilters, value: string) => {
    if (isLoading) return;
    
    const newFilters = {
      ...activeFilters,
      [type]: value,
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const FilterSection = ({ 
    title, 
    options, 
    type 
  }: { 
    title: string; 
    options: { label: string; value: string; }[]; 
    type: keyof typeof activeFilters;
  }) => (
    <div className="space-y-2">
      <motion.h3 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-surface-600 dark:text-surface-400"
      >
        {title}
      </motion.h3>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="wait">
          {options.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => handleFilterClick(type, option.value)}
              disabled={isLoading}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={!isLoading ? { scale: 1.05 } : {}}
              whileTap={!isLoading ? { scale: 0.95 } : {}}
              className={`filter-button relative overflow-hidden ${
                activeFilters[type] === option.value ? 'filter-button-active' : ''
              } ${isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <span className="relative z-10">{option.label}</span>
              {activeFilters[type] === option.value && (
                <motion.span
                  layoutId={`active-${type}`}
                  className="absolute inset-0 bg-primary-500/10 dark:bg-primary-400/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              {isLoading && activeFilters[type] === option.value && (
                <motion.div
                  className={`absolute inset-0 ${
                    isDark 
                      ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
                      : 'bg-gradient-to-r from-transparent via-black/5 to-transparent'
                  }`}
                  variants={shimmerAnimation}
                  initial="initial"
                  animate="animate"
                />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="filter-bar relative"
    >
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/50 dark:bg-navy-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
            <span className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Mise à jour des filtres...
            </span>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <FilterSection
          title="Période"
          options={dateRanges}
          type="dateRange"
        />
        <FilterSection
          title="Catégorie"
          options={categories}
          type="category"
        />
        <FilterSection
          title="Statut"
          options={statuses}
          type="status"
        />
      </div>
    </motion.div>
  );
};