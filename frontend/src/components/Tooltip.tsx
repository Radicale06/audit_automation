import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'right',
  delay = 200 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - 8;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - 8;
            y = rect.top + rect.height / 2;
            break;
        }

        setCoordinates({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={targetRef}
        className="inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg",
            "transition-all duration-200 pointer-events-none select-none",
            {
              'transform -translate-x-1/2 -translate-y-full': position === 'top',
              'transform translate-y-1/2': position === 'right',
              'transform -translate-x-1/2': position === 'bottom',
              'transform -translate-x-full translate-y-1/2': position === 'left'
            }
          )}
          style={{
            left: `${coordinates.x}px`,
            top: `${coordinates.y}px`
          }}
          role="tooltip"
        >
          {content}
          <div 
            className={cn(
              "absolute w-2 h-2 bg-gray-900 transform rotate-45",
              {
                'left-1/2 -translate-x-1/2 bottom-[-4px]': position === 'top',
                '-left-1 top-1/2 -translate-y-1/2': position === 'right',
                'left-1/2 -translate-x-1/2 top-[-4px]': position === 'bottom',
                '-right-1 top-1/2 -translate-y-1/2': position === 'left'
              }
            )} 
          />
        </div>
      )}
    </>
  );
};

export default Tooltip;