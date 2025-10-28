import React, { createContext, useContext, useEffect, useState } from 'react';

interface UserPreferences {
  darkMode: boolean;
  language: 'fr' | 'en' | 'es' | 'de';
  notifications: boolean;
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  twoFactorAuth: boolean;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  darkMode: false,
  language: 'fr',
  notifications: true,
  fontSize: 'medium',
  soundEnabled: true,
  twoFactorAuth: false,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const stored = localStorage.getItem('userPreferences');
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    // Apply preferences to document
    document.documentElement.classList.toggle('dark', preferences.darkMode);
    document.documentElement.setAttribute('data-font-size', preferences.fontSize);
    document.documentElement.lang = preferences.language;
  }, [preferences]);

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences,
    }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <UserPreferencesContext.Provider 
      value={{ 
        preferences, 
        updatePreferences, 
        resetPreferences 
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};