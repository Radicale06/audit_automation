import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProfile } from '../context/UserProfileContext';
import LoadingSpinner from './LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useUserProfile();

  // Show loading while user data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to dashboard if user is not an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminGuard;
