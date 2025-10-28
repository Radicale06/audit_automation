import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  History, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Users,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatHistory } from '../context/ChatHistoryContext';
import { useSidebar } from '../context/SidebarContext';
import { useUserProfile } from '../context/UserProfileContext';
import { cn } from '../utils/cn';
import Tooltip from './Tooltip';

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  type?: never;
}

interface MenuDivider {
  type: 'divider';
  icon?: never;
  label?: never;
  path?: never;
}

type MenuItems = MenuItem | MenuDivider;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useChatHistory();
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { user, logout } = useUserProfile();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems: MenuItems[] = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: MessageSquare, label: 'Assistant IA', path: '/chat' },
    // Only show user management for admin users
    ...(user?.role === 'admin' ? [{ icon: Users, label: 'Gestion des utilisateurs', path: '/users' }] : []),
    { type: 'divider' as const },
    // Only show Historique for admin users
    ...(user?.role === 'admin' ? [{ icon: History, label: 'Historique', path: '/historique' }] : []),
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <>
      <aside
        className={cn(
        "sidebar custom-scrollbar h-screen sticky top-0",
        "bg-gradient-to-b from-white/95 via-white/90 to-white/95",
        "dark:from-navy-900/95 dark:via-navy-900/90 dark:to-navy-900/95",
        "border-r border-surface-200/50 dark:border-surface-700/50",
        "shadow-xl backdrop-blur-xl",
        "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] transform",
        isCollapsed ? 'w-16' : 'w-64',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <div className={cn(
            "flex items-center space-x-3 transition-all duration-300",
            isCollapsed && "justify-center w-full"
          )}>
            <div className="bg-primary-500 p-2 rounded-lg shrink-0">
              <img src="/logo.png" alt="HAT Security" className="h-6 w-6" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-semibold text-surface-900 dark:text-surface-100 font-display">
                HAT Security AI 
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="sidebar-collapse-button hidden lg:block"
              aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
            >
              {isCollapsed ? (
                <ChevronRight className="sidebar-collapse-icon" />
              ) : (
                <ChevronLeft className="sidebar-collapse-icon" />
              )}
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="sidebar-button-hover lg:hidden"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col h-full">
            <div className="space-y-2 flex-1">
              {menuItems.map((item, index) => {
                if (item.type === 'divider') {
                  return <div key={index} className="h-px bg-surface-200 dark:bg-surface-700 my-4" />;
                }

                const isActive = item.path === location.pathname;
                const Icon = item.icon;

                const menuItem = (
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    whileHover={{ 
                      scale: 1.03, 
                      x: 5,
                      backgroundColor: isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(229, 231, 235, 0.5)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 1
                    }}
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                      isCollapsed ? "justify-center" : "space-x-3",
                      isActive
                        ? "bg-primary-500/10 text-primary-500"
                        : "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
                      "dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100",
                      loading && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={loading}
                  >
                    <Icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "stroke-[2px]" : "stroke-[1.25px]"
                    )} />
                    {!isCollapsed && (
                      <span className="font-medium font-sans truncate">{item.label}</span>
                    )}
                  </motion.button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.label} content={item.label} position="right">
                    {menuItem}
                  </Tooltip>
                ) : menuItem;
              })}
            </div>
            
            <div className="pt-4 mt-auto">
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02, x: 3, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                  isCollapsed ? "justify-center" : "space-x-3",
                  "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                )}
              >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && (
                  <span className="font-medium">Déconnexion</span>
                )}
              </motion.button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;