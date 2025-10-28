import { useEffect, useState, useRef, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  enableObserver?: boolean;
}

type IntersectionResult = {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  frozen: boolean;
};

export function useIntersectionObserver<T extends Element = Element>(
  options: UseIntersectionObserverOptions = {}
): [
  (element: T | null) => void,
  IntersectionResult,
  () => void
] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
    enableObserver = true
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [frozen, setFrozen] = useState(false);
  
  const previousElement = useRef<Element | null>(null);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const unfreeze = useCallback(() => {
    setFrozen(false);
  }, []);

  const frozen_isIntersecting = entry?.isIntersecting ?? initialIsIntersecting;
  const unfrozen_isIntersecting = frozen ? frozen_isIntersecting : (entry?.isIntersecting ?? initialIsIntersecting);

  useEffect(() => {
    if (freezeOnceVisible && entry?.isIntersecting) {
      setFrozen(true);
    }
  }, [freezeOnceVisible, entry?.isIntersecting]);

  useEffect(() => {
    if (!enableObserver) return;
    
    const element = currentElement;

    if (element === previousElement.current) return;
    
    if (observer.current) {
      if (previousElement.current) {
        observer.current.unobserve(previousElement.current);
      }
      observer.current.disconnect();
    }

    previousElement.current = element;

    if (!element) return;

    const observerOptions = {
      threshold,
      root,
      rootMargin,
    };

    observer.current = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, observerOptions);

    observer.current.observe(element);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [
    currentElement,
    root,
    rootMargin,
    JSON.stringify(threshold),
    enableObserver
  ]);

  const result: IntersectionResult = {
    isIntersecting: unfrozen_isIntersecting,
    entry,
    frozen
  };

  return [setCurrentElement, result, unfreeze];
}

// Utility hooks built on top of useIntersectionObserver
export function useIsVisible<T extends Element = Element>(
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'> = {}
): [(element: T | null) => void, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver({
    ...options,
    freezeOnceVisible: false
  });
  return [ref, isIntersecting];
}

export function useHasBeenVisible<T extends Element = Element>(
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible'> = {}
): [(element: T | null) => void, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver({
    ...options,
    freezeOnceVisible: true
  });
  return [ref, isIntersecting];
}

export function useLazyLoad<T extends Element = Element>(
  options: Omit<UseIntersectionObserverOptions, 'freezeOnceVisible' | 'threshold'> = {}
): [(element: T | null) => void, boolean] {
  const [ref, { isIntersecting }] = useIntersectionObserver({
    threshold: 0.1,
    ...options,
    freezeOnceVisible: true
  });
  return [ref, isIntersecting];
}

// Exemple d'utilisation:
// const [ref, isVisible, unfreeze] = useIntersectionObserver({
//   threshold: 0.5,
//   rootMargin: '50px',
//   freezeOnceVisible: true
// });
//
// const [ref, isVisible] = useIsVisible();
// const [ref, hasBeenVisible] = useHasBeenVisible();
// const [ref, shouldLoad] = useLazyLoad();