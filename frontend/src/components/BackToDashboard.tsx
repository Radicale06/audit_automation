import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import { useUserProfile } from '../context/UserProfileContext';

const BackToDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUserProfile();

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-100 rounded-lg transition-all duration-200 border border-gray-600"
      aria-label="Retour au tableau de bord"
    >
      <LayoutDashboard className="w-4 h-4" />
      <span className="text-sm font-medium">Dashboard</span>
    </button>
  );
};

export default BackToDashboard;