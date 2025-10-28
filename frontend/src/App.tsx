import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import AdminGuard from './components/AdminGuard';
import { useSelector } from "react-redux";
import DashbordLayout from './layouts/DashboardLayout';
import { LanguageProvider } from './context/LanguageContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const UserManagementPage = React.lazy(() => import('./pages/UserManagementPage'));
const HistoriquePage = React.lazy(() => import('./pages/HistoriquePage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  const { token } = useSelector((state: any) => state?.auth);

  function PublicRouteRender(props: any) {
    return !token ? (
      props.children
    ) : (
      <Navigate to="/dashboard" />
    );
  }

  function PrivateRouteRender(props: any) {
    return !token ? (
      <Navigate to="/login" />
    ) : (
      props.children
    );
  }

  return (
    <LanguageProvider>
      <UserPreferencesProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              element={
                <PublicRouteRender>
                  <Outlet />
                </PublicRouteRender>
              }
            >
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            <Route
              element={
                <PrivateRouteRender>
                  <Outlet />
                </PrivateRouteRender>
              }
            >
              <Route path="/chat" element={<ChatPage />} />

              <Route
                element={
                  <DashbordLayout>
                    <Outlet />
                  </DashbordLayout>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route 
                  path="/users" 
                  element={
                    <AdminGuard>
                      <UserManagementPage />
                    </AdminGuard>
                  } 
                />
                <Route path="/historique" element={<HistoriquePage />} />
                <Route path="/*" element={<></>} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </UserPreferencesProvider>
    </LanguageProvider>
  );
}

export default App;
