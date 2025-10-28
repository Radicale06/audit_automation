import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      recent_activity: 'Activité récente',
      view_all_history: 'Voir tout l\'historique',
      dark_mode: 'Mode sombre',
      light_mode: 'Mode clair',
      export_history: 'Exporter l\'historique',
      settings: 'Paramètres',
      logout: 'Déconnexion',
      activity_history: 'Historique d\'activité',
      export_to_csv: 'Exporter en CSV',
      online: 'En ligne',
      offline: 'Hors ligne'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;