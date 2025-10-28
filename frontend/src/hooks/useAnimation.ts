import { useCallback, useEffect, useRef, useState } from 'react';
import { springConfig, easingConfig, durations } from '../utils/animation';
import { useReducedMotion as framerUseReducedMotion } from 'framer-motion';

export const useReducedMotion = framerUseReducedMotion;


interface AnimationOptions {
  duration?: number;
  easing?: keyof typeof easingConfig;
  spring?: keyof typeof springConfig;
  delay?: number;
  repeat?: number;
  repeatDelay?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;
}

interface AnimationControls {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reverse: () => void;
  seek: (progress: number) => void;
  isAnimating: boolean;
  isPaused: boolean;
  progress: number;
}

type AnimationPreset = 'fadeIn' | 'fadeOut' | 'slideIn' | 'slideOut' | 'scale' | 'bounce' | 'shake';

const defaultOptions: Required<Omit<AnimationOptions, 'onComplete' | 'onUpdate'>> = {
  duration: durations.normal * 1000,
  easing: 'smooth',
  spring: 'medium',
  delay: 0,
  repeat: 0,
  repeatDelay: 0,
  repeatType: 'loop',
};

const presets: Record<AnimationPreset, AnimationOptions> = {
  fadeIn: {
    duration: durations.normal * 1000,
    easing: 'smooth',
  },
  fadeOut: {
    duration: durations.normal * 1000,
    easing: 'smooth',
  },
  slideIn: {
    duration: durations.normal * 1000,
    easing: 'snappy',
  },
  slideOut: {
    duration: durations.normal * 1000,
    easing: 'snappy',
  },
  scale: {
    duration: durations.normal * 1000,
    spring: 'medium',
  },
  bounce: {
    duration: durations.slow * 1000,
    spring: 'gentle',
    repeat: 1,
    repeatType: 'reverse',
  },
  shake: {
    duration: durations.fast * 1000,
    easing: 'snappy',
    repeat: 2,
    repeatType: 'mirror',
  },
};

export function useAnimation(
  options: AnimationOptions = {},
  preset?: AnimationPreset
): AnimationControls {
  const mergedOptions = {
    ...defaultOptions,
    ...(preset ? presets[preset] : {}),
    ...options,
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const pausedTimeRef = useRef<number>();
  const pauseDurationRef = useRef(0);
  const currentRepeatRef = useRef(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current - pauseDurationRef.current;
      let currentProgress = Math.min(elapsed / mergedOptions.duration, 1);

      if (mergedOptions.easing && !mergedOptions.spring) {
        const ease = easingConfig[mergedOptions.easing];
        currentProgress = ease[0] * currentProgress + ease[1];
      }

      setProgress(currentProgress);
      mergedOptions.onUpdate?.(currentProgress);

      if (currentProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (mergedOptions.repeat && mergedOptions.repeat > currentRepeatRef.current) {
          currentRepeatRef.current++;
          startTimeRef.current = timestamp + mergedOptions.repeatDelay;
          
          if (mergedOptions.repeatType === 'reverse') {
            const temp = mergedOptions.onUpdate;
            mergedOptions.onUpdate = progress => temp?.(1 - progress);
          }
          
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          mergedOptions.onComplete?.();
        }
      }
    },
    [mergedOptions]
  );

  const start = useCallback(() => {
    setIsAnimating(true);
    setIsPaused(false);
    startTimeRef.current = undefined;
    pauseDurationRef.current = 0;
    currentRepeatRef.current = 0;

    if (mergedOptions.delay) {
      setTimeout(() => {
        animationRef.current = requestAnimationFrame(animate);
      }, mergedOptions.delay);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate, mergedOptions.delay]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsAnimating(false);
    setIsPaused(false);
    setProgress(0);
    startTimeRef.current = undefined;
    pausedTimeRef.current = undefined;
    pauseDurationRef.current = 0;
    currentRepeatRef.current = 0;
  }, []);

  const pause = useCallback(() => {
    if (animationRef.current && isAnimating && !isPaused) {
      cancelAnimationFrame(animationRef.current);
      pausedTimeRef.current = performance.now();
      setIsPaused(true);
    }
  }, [isAnimating, isPaused]);

  const resume = useCallback(() => {
    if (isPaused && pausedTimeRef.current) {
      pauseDurationRef.current += performance.now() - pausedTimeRef.current;
      setIsPaused(false);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate, isPaused]);

  const reverse = useCallback(() => {
    const temp = mergedOptions.onUpdate;
    mergedOptions.onUpdate = progress => temp?.(1 - progress);
    start();
  }, [mergedOptions, start]);

  const seek = useCallback(
    (targetProgress: number) => {
      setProgress(targetProgress);
      mergedOptions.onUpdate?.(targetProgress);
    },
    [mergedOptions]
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    start,
    stop,
    pause,
    resume,
    reverse,
    seek,
    isAnimating,
    isPaused,
    progress,
  };
}

// Hooks spécialisés pour des cas d'utilisation communs
export function useFadeAnimation(options?: AnimationOptions) {
  return useAnimation(options, 'fadeIn');
}

export function useSlideAnimation(options?: AnimationOptions) {
  return useAnimation(options, 'slideIn');
}

export function useScaleAnimation(options?: AnimationOptions) {
  return useAnimation(options, 'scale');
}

// Exemple d'utilisation:
// const animation = useAnimation({
//   duration: 1000,
//   easing: 'smooth',
//   onUpdate: (progress) => {
//     element.style.opacity = progress;
//   },
//   onComplete: () => {
//     console.log('Animation terminée');
//   },
// }, 'fadeIn');
//
// animation.start();