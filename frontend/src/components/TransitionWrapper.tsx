import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import * as animations from '../utils/animation';

type AnimationType = 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'modal';
type AnimationDuration = 'fast' | 'normal' | 'slow';

interface TransitionWrapperProps {
  children: React.ReactNode;
  show: boolean;
  type?: AnimationType;
  duration?: AnimationDuration;
  className?: string;
  customVariants?: Variants;
}

const getVariants = (type: AnimationType): Variants => {
  switch (type) {
    case 'fade':
      return animations.fadeInOut;
    case 'slideUp':
      return animations.slideUpInOut;
    case 'slideRight':
      return animations.slideRightInOut;
    case 'scale':
      return animations.scaleInOut;
    case 'modal':
      return animations.modalVariants;
    default:
      return animations.fadeInOut;
  }
};

const durations: Record<AnimationDuration, number> = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5
};

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  show,
  type = 'fade',
  duration = 'normal',
  className,
  customVariants
}) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    if (show) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), durations[duration] * 1000);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!mounted && !show) return null;

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          variants={customVariants || getVariants(type)}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
          transition={{
            duration: durations[duration],
            ease: [0.32, 0.72, 0, 1]
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionWrapper;