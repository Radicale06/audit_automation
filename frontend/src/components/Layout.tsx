import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { useUserPreferences } from '../context/UserPreferencesContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const { preferences } = useUserPreferences();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.textColor}`}>
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
};
