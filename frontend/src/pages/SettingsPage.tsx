import React, { useEffect, useState } from 'react';
import { Settings, Moon, Sun, Bell, Languages, Type, RotateCcw, Volume2, Shield, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import BackToDashboard from '../components/BackToDashboard';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

// Setting interfaces
interface SettingOption {
  value: string;
  label: string;
}

interface BaseSetting {
  name: string;
  label: string;
  type: 'toggle' | 'buttons' | 'select';
  icon?: React.ReactNode;
}

interface ToggleSetting extends BaseSetting {
  type: 'toggle';
  value: boolean;
}

interface ButtonsSetting extends BaseSetting {
  type: 'buttons';
  value: string;
  options: SettingOption[];
}

interface SelectSetting extends BaseSetting {
  type: 'select';
  value: string;
  options: SettingOption[];
  onChange?: (value: string) => void;
}

type Setting = ToggleSetting | ButtonsSetting | SelectSetting;

interface SettingSection {
  title: string;
  icon: React.ReactNode;
  settings: Setting[];
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const { preferences, updatePreferences, resetPreferences } = useUserPreferences();
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetPreferences();
      showToast('Réinitialisation', 'Paramètres réinitialisés avec succès', { type: 'success' });
    } catch (error) {
      showToast('Erreur', 'Échec de la réinitialisation', { type: 'error' });
    } finally {
      setIsResetting(false);
    }
  };

  const handlePreferenceUpdate = (key: string, value: any) => {
    updatePreferences({ [key]: value });
    showToast('Mise à jour', 'Paramètres mis à jour avec succès', { type: 'success' });
  };

  const handleLanguageChange = (newLang: string) => {
    try {
      const languageValue = newLang as 'fr' | 'en' | 'es' | 'de';
      updatePreferences({ language: languageValue });
      document.documentElement.lang = languageValue;
      localStorage.setItem('selectedLanguage', languageValue);
      showToast('Succès', 'Langue modifiée avec succès', { type: 'success' });
      
      // Force reload after a short delay to ensure settings are saved
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      showToast('Erreur', 'Impossible de changer la langue', { type: 'error' });
    }
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' }
  ];

  const settingSections: SettingSection[] = [
    {
      title: 'Apparence',
      icon: <Eye className="w-5 h-5 text-gray-300" />,
      settings: [
        {
          name: 'darkMode',
          label: 'Mode sombre',
          icon: preferences.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />,
          type: 'toggle',
          value: preferences.darkMode
        },
        {
          name: 'fontSize',
          label: 'Taille du texte',
          icon: <Type className="w-5 h-5" />,
          type: 'buttons',
          value: preferences.fontSize,
          options: fontSizeOptions
        }
      ]
    },
    {
      title: 'Notifications',
      icon: <Bell className="w-5 h-5 text-gray-300" />,
      settings: [
        {
          name: 'notifications',
          label: 'Activer les notifications',
          type: 'toggle',
          value: preferences.notifications
        },
        {
          name: 'soundEnabled',
          label: 'Sons de notification',
          icon: <Volume2 className="w-5 h-5" />,
          type: 'toggle',
          value: preferences.soundEnabled || false
        }
      ]
    },
    {
      title: 'Langue et Région',
      icon: <Languages className="w-5 h-5 text-gray-300" />,
      settings: [
        {
          name: 'language',
          label: 'Langue de l\'interface',
          type: 'select',
          value: preferences.language || 'fr',
          onChange: handleLanguageChange,
          options: [
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Español' },
            { value: 'de', label: 'Deutsch' }
          ]
        }
      ]
    },
    {
      title: 'Sécurité',
      icon: <Shield className="w-5 h-5 text-gray-300" />,
      settings: [
        {
          name: 'twoFactorAuth',
          label: 'Authentification à deux facteurs',
          type: 'toggle',
          value: preferences.twoFactorAuth || false
        }
      ]
    }
  ];

  // Add textColorClass helper
  const textColorClass = preferences.darkMode ? 'text-white' : 'text-black';
  const textSecondaryClass = preferences.darkMode ? 'text-gray-300' : 'text-gray-600';

  const isToggleSetting = (setting: Setting): setting is ToggleSetting => 
    setting.type === 'toggle';

  const isButtonsSetting = (setting: Setting): setting is ButtonsSetting =>
    setting.type === 'buttons';

  const isSelectSetting = (setting: Setting): setting is SelectSetting =>
    setting.type === 'select';

  return (
    <motion.div 

    >


        {/* Standardized Card Container */}

          <div className="flex items-center justify-between mb-8 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <BackToDashboard />
              <div className="flex items-center gap-3">
                <Settings className={`w-6 h-6 ${textColorClass}`} />
                <h1 className={`text-2xl font-semibold ${textColorClass}`}>Paramètres</h1>
              </div>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>{isResetting ? 'Réinitialisation...' : 'Réinitialiser'}</span>
            </button>
          </div>

          <div className="grid gap-6 p-6">
            {settingSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${
                  preferences.darkMode 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-white/50 border-gray-200/50'
                } backdrop-blur-sm rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={textSecondaryClass}>{section.icon}</span>
                    <h2 className={`text-lg font-semibold ${textColorClass}`}>
                      {section.title}
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    {section.settings.map((setting) => (
                      <div key={setting.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {setting.icon && <span className={textSecondaryClass}>{setting.icon}</span>}
                          <span className={textSecondaryClass}>{setting.label}</span>
                        </div>

                        {isToggleSetting(setting) && (
                          <button
                            onClick={() => handlePreferenceUpdate(setting.name, !setting.value)}
                            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200"
                            style={{ backgroundColor: setting.value ? '#3B82F6' : '#374151' }}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        )}

                        {isButtonsSetting(setting) && (
                          <div className="flex gap-2">
                            {setting.options.map(option => (
                              <button
                                key={option.value}
                                onClick={() => handlePreferenceUpdate(setting.name, option.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  setting.value === option.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {isSelectSetting(setting) && (
                          <select
                            value={setting.value}
                            onChange={(e) => setting.onChange ? setting.onChange(e.target.value) : handlePreferenceUpdate(setting.name, e.target.value)}
                            className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {setting.options.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>


    </motion.div>
  );
};

export default SettingsPage;