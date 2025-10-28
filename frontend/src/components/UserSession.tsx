import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut,
  ChevronDown,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import LogoutModal from './LogoutModal';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

const UserSession = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useUserProfile();
  const { preferences, updatePreferences } = useUserPreferences();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  if (!user) return null;

  const menuVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <>
      <div className="relative z-10" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg",
            "hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-800"
          )}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label="Menu utilisateur"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user.firstname && user.lastname ? `${user.firstname[0]}${user.lastname[0]}` : '?'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-surface-800" />
          </div>
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-surface-500 dark:text-surface-400 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "absolute right-0 mt-2 w-72 rounded-xl bg-black shadow-elevation-3",
                "bg-white dark:bg-black border border-surface-200 bg-black dark:border-surface-700",
                "divide-y divide-surface-200 bg-black dark:divide-surface-700"
              )}
            >
              <div className="p-4">
                <div className="flex flex-col">
                  <p className="font-semibold text-surface-900 dark:text-surface-100">
                    {user.firstname} {user.lastname}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 text-xs rounded-full",
                      user.role === 'admin' 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                    <span className={cn(
                      "flex items-center gap-1 px-2 py-0.5 text-xs rounded-full",
                      user.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      )} />
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {/* Thème */}
                <button
                  onClick={() => updatePreferences({ darkMode: !preferences.darkMode })}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    {preferences.darkMode ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                    <span>Mode {preferences.darkMode ? 'sombre' : 'clair'}</span>
                  </div>
                  <div className="relative">
                    <div className={cn(
                      "w-8 h-4 rounded-full transition-colors",
                      preferences.darkMode ? "bg-primary-500" : "bg-surface-200 dark:bg-surface-700"
                    )}>
                      <div className={cn(
                        "absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-200",
                        preferences.darkMode && "translate-x-4"
                      )} />
                    </div>
                  </div>
                </button>

                {/* Paramètres */}
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Paramètres</span>
                </button>

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
      />
    </>
  );
};

export default UserSession;