import { useState, useEffect } from 'react';

type MediaQuery =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | 'dark'
  | 'light'
  | 'portrait'
  | 'landscape'
  | 'motion-safe'
  | 'motion-reduce'
  | 'contrast-more'
  | 'contrast-less';

const mediaQueries: Record<MediaQuery, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  dark: '(prefers-color-scheme: dark)',
  light: '(prefers-color-scheme: light)',
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',
  'motion-safe': '(prefers-reduced-motion: no-preference)',
  'motion-reduce': '(prefers-reduced-motion: reduce)',
  'contrast-more': '(prefers-contrast: more)',
  'contrast-less': '(prefers-contrast: less)',
};

const useMediaQuery = (query: MediaQuery | string) => {
  const [matches, setMatches] = useState(false);
  const [mediaQueryList, setMediaQueryList] = useState<MediaQueryList | null>(null);

  useEffect(() => {
    const mediaQuery = mediaQueries[query as MediaQuery] || query;
    const list = window.matchMedia(mediaQuery);
    setMediaQueryList(list);
    setMatches(list.matches);

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    list.addEventListener('change', listener);
    return () => list.removeEventListener('change', listener);
  }, [query]);

  return {
    matches,
    mediaQueryList
  };
};

export const useBreakpoint = (breakpoint: Exclude<MediaQuery, 'dark' | 'light'>) => {
  const { matches } = useMediaQuery(breakpoint);
  return matches;
};

export const useColorScheme = () => {
  const { matches: isDark } = useMediaQuery('dark');
  return {
    isDark,
    isLight: !isDark,
    colorScheme: isDark ? 'dark' : 'light' as const
  };
};

export const useReducedMotion = () => {
  const { matches } = useMediaQuery('motion-reduce');
  return matches;
};

export const useContrastPreference = () => {
  const { matches: prefersMore } = useMediaQuery('contrast-more');
  return {
    prefersMore,
    prefersLess: !prefersMore
  };
};

export default useMediaQuery;