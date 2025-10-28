import { useState, useEffect, useCallback } from 'react';
import { useUserPreferences } from '../context/UserPreferencesContext';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = Record<string, string>;

interface ThemeConfig {
  name: Theme;
  colors: ColorScheme;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const defaultLightColors: ColorScheme = {
  primary: '#2563eb',
  secondary: '#4f46e5',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#475569',
  border: '#e2e8f0',
  divider: '#cbd5e1',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const defaultDarkColors: ColorScheme = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: '#334155',
  divider: '#475569',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

const defaultConfig: ThemeConfig = {
  name: 'system',
  colors: defaultLightColors,
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'SF Mono, Menlo, Monaco, Consolas, monospace',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

const THEME_STORAGE_KEY = 'app-theme-preference';

export function useTheme(initialTheme: Theme = 'system') {
  const { preferences } = useUserPreferences();

  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || initialTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [config, setConfig] = useState<ThemeConfig>(() => ({
    ...defaultConfig,
    name: theme,
    colors: theme === 'dark' ? defaultDarkColors : defaultLightColors,
  }));

  // Écoute les changements de thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Met à jour le thème quand le thème système change
  useEffect(() => {
    if (theme === 'system') {
      setConfig(prev => ({
        ...prev,
        colors: systemTheme === 'dark' ? defaultDarkColors : defaultLightColors,
      }));
    }
  }, [systemTheme, theme]);

  // Applique les styles CSS personnalisés
  useEffect(() => {
    const root = document.documentElement;
    const colors = theme === 'system' 
      ? (systemTheme === 'dark' ? defaultDarkColors : defaultLightColors)
      : (theme === 'dark' ? defaultDarkColors : defaultLightColors);

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(config.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    Object.entries(config.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(config.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    Object.entries(config.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(
      theme === 'system' 
        ? `${systemTheme}-theme`
        : `${theme}-theme`
    );
  }, [theme, systemTheme, config]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    setConfig(prev => ({
      ...prev,
      name: newTheme,
      colors: newTheme === 'system'
        ? (systemTheme === 'dark' ? defaultDarkColors : defaultLightColors)
        : (newTheme === 'dark' ? defaultDarkColors : defaultLightColors),
    }));
  }, [systemTheme]);

  const updateColors = useCallback((newColors: Partial<ColorScheme>) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...(newColors as ColorScheme) },
    }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ThemeConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
    }));
  }, []);

  const customTheme = {
    textColor: preferences.darkMode ? 'text-white' : 'text-black',
    textSecondary: preferences.darkMode ? 'text-gray-300' : 'text-gray-600',
    background: preferences.darkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100',
    cardBg: preferences.darkMode ? 'bg-gray-800/50' : 'bg-white/50',
    borderColor: preferences.darkMode ? 'border-gray-700/50' : 'border-gray-200/50',
    inputBg: preferences.darkMode ? 'bg-gray-700' : 'bg-gray-100',
    buttonPrimary: preferences.darkMode 
      ? 'bg-blue-600 hover:bg-blue-700' 
      : 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: preferences.darkMode
      ? 'bg-gray-700 hover:bg-gray-600'
      : 'bg-gray-200 hover:bg-gray-300'
  };

  return {
    theme,
    systemTheme,
    config,
    setTheme,
    updateColors,
    updateConfig,
    isDark: theme === 'dark' || (theme === 'system' && systemTheme === 'dark'),
    customTheme,
  };
}

// Exemple d'utilisation:
// const { 
//   theme,
//   config,
//   setTheme,
//   updateColors,
//   isDark 
// } = useTheme();
//
// // Changer le thème
// setTheme('dark');
//
// // Mettre à jour les couleurs
// updateColors({
//   primary: '#3b82f6',
//   secondary: '#6366f1',
// });