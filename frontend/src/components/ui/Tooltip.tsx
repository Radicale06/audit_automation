import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import useMediaQuery from '../../hooks/useMediaQuery';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  showArrow?: boolean;
  maxWidth?: string;
  interactive?: boolean;
}

const getPositionStyles = (position: TooltipPosition) => {
  switch (position) {
    case 'top':
      return {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px'
      };
    case 'bottom':
      return {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '8px'
      };
    case 'left':
      return {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '8px'
      };
    case 'right':
      return {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px'
      };
  }
};

const getArrowStyles = (position: TooltipPosition) => {
  const size = '6px';
  const commonStyles = {
    position: 'absolute',
    width: '0',
    height: '0',
    border: `${size} solid transparent`
  } as const;

  switch (position) {
    case 'top':
      return {
        ...commonStyles,
        bottom: `-${size}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: 'currentColor'
      };
    case 'bottom':
      return {
        ...commonStyles,
        top: `-${size}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: 'currentColor'
      };
    case 'left':
      return {
        ...commonStyles,
        right: `-${size}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderLeftColor: 'currentColor'
      };
    case 'right':
      return {
        ...commonStyles,
        left: `-${size}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderRightColor: 'currentColor'
      };
  }
};

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className,
  showArrow = true,
  maxWidth = '200px',
  interactive = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [computedPosition, setComputedPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const reducedMotion = useMediaQuery('motion-reduce');

  const updatePosition = () => {
    if (!tooltipRef.current || !targetRef.current) return;

    const tooltip = tooltipRef.current.getBoundingClientRect();
    const target = targetRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let newPosition = position;

    // Vérifier si le tooltip dépasse les limites de l'écran
    if (position === 'top' && target.top - tooltip.height < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && target.bottom + tooltip.height > viewport.height) {
      newPosition = 'top';
    } else if (position === 'left' && target.left - tooltip.width < 0) {
      newPosition = 'right';
    } else if (position === 'right' && target.right + tooltip.width > viewport.width) {
      newPosition = 'left';
    }

    setComputedPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const variants = {
    initial: { 
      opacity: 0,
      scale: 0.95
    },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: reducedMotion ? 0 : 0.15,
        ease: [0.32, 0.72, 0, 1]
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: reducedMotion ? 0 : 0.1
      }
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={!interactive ? handleMouseLeave : undefined}
      onFocus={handleMouseEnter}
      onBlur={!interactive ? handleMouseLeave : undefined}
      ref={targetRef}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={cn(
              "absolute z-50 px-2 py-1 text-xs font-medium",
              "text-white bg-surface-900 dark:bg-surface-800",
              "rounded shadow-elevation-2",
              "pointer-events-none select-none",
              interactive && "pointer-events-auto",
              className
            )}
            style={{
              ...getPositionStyles(computedPosition),
              maxWidth
            }}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {content}
            {showArrow && (
              <div
                className="text-surface-900 dark:text-surface-800"
                style={getArrowStyles(computedPosition)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { Tooltip };