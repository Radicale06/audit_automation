import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AppRouter = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const LanguageSelector = () => (
    <div className="fixed bottom-4 right-4 flex gap-2 z-50">
      <button
        onClick={() => changeLanguage('fr')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          i18n.language === 'fr'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          i18n.language === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          i18n.language === 'ar'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        AR
      </button>
    </div>
  );

  return (
    <Router>
      <LanguageSelector />
      <Routes>
        {/* Add your routes here */}
      </Routes>
    </Router>
  );
};

export default AppRouter;
