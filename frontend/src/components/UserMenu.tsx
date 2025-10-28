import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  User, Settings, LogOut, ChevronDown, Moon, Sun,
  Globe, FileText, MessageSquare, FileBarChart, Download
} from 'lucide-react';
import { useUserHistory } from '../context/UserHistoryContext';
import LogoutModal from './LogoutModal';
import HistoryModal from './HistoryModal';

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    role: 'Auditeur' | 'Admin';
    initials: string;
  };
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items: historyItems, exportToCSV } = useUserHistory();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'chat': return MessageSquare;
      case 'report': return FileBarChart;
      default: return FileText;
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-50" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 px-4 py-2 bg-white rounded-lg shadow-elevation-3 hover:bg-gray-50 transition-all duration-200"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
              {user.initials}
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className={`
          absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-elevation-3 transform transition-all duration-200 origin-top-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
        `}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-medium text-lg">
                  {user.initials}
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-primary bg-opacity-10 text-primary'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <div className="mb-4">
              <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                {t('recent_activity')}
              </h3>
              <div className="space-y-1">
                {historyItems.slice(0, 5).map((item) => {
                  const Icon = getIconForType(item.type);
                  return (
                    <button
                      key={item.id}
                      onClick={() => item.path && navigate(item.path)}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center space-x-3"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 truncate">{item.action}</span>
                      <span className="text-xs text-gray-400">{formatTimestamp(item.timestamp)}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="mt-2 w-full px-3 py-2 text-sm text-primary hover:bg-primary hover:bg-opacity-5 rounded-lg flex items-center justify-center"
              >
                {t('view_all_history')}
              </button>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{t(isDarkMode ? 'dark_mode' : 'light_mode')}</span>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isDarkMode ? 'translate-x-4' : ''}`} />
                </div>
              </button>

              <button
                onClick={() => exportToCSV()}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('export_history')}</span>
              </button>

              <button
                onClick={() => navigate('/settings')}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>{t('settings')}</span>
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          navigate('/login');
        }}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={historyItems}
      />
    </>
  );
};

export default UserMenu;