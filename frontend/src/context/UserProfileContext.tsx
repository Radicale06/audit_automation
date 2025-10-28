import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, UserProfile } from '../api/authService';
import { handleApiError, ApiError } from '../api/errorUtils';
import { useToast } from './ToastContext';
import { useDispatch, useSelector } from 'react-redux';
import { resetCredentials } from '../redux/AuthReducer';
export { UserProfileContext };


interface UserProfileContextType {
  user: UserProfile | null;
  loading: boolean;
  error: ApiError | null;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const { showToast } = useToast();
  const { token } = useSelector((state: any) => state.auth);

  const clearError = () => setError(null);

  // Chargement initial du profil utilisateur
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getUserProfile();
        setUser(response.user);
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError);
        showToast(apiError.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [token, showToast]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setLoading(true);
      clearError();
      const response = await authService.updateProfile(data);
      setUser(response.user);
      showToast('Profil mis à jour avec succès', 'success');
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      showToast(apiError.message, 'error');
      throw apiError;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    dispatch(resetCredentials());
    setUser(null);
    showToast('Déconnexion réussie', 'info');
  };

  return (
    <UserProfileContext.Provider
      value={{
        user,
        loading,
        error,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};