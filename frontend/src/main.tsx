import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.tsx';
import { Provider } from "react-redux";

import { UserHistoryProvider } from './context/UserHistoryContext';
import { ChatHistoryProvider } from './context/ChatHistoryContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { UserProfileProvider } from './context/UserProfileContext';
import { SidebarProvider } from './context/SidebarContext';
import { ToastProvider } from './context/ToastContext';
import './i18n';
import './index.css';
import { store, persistor } from './redux/Store.ts';

// @ts-ignore
import { PersistGate } from 'redux-persist/integration/react';

// Configuration des drapeaux pour React Router v7
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <StrictMode>
        <Router {...router}>
          <ToastProvider>
            <UserProfileProvider>
              <UserPreferencesProvider>
                <SidebarProvider>
                  <UserHistoryProvider>
                    <ChatHistoryProvider>
                      <App />
                    </ChatHistoryProvider>
                  </UserHistoryProvider>
                </SidebarProvider>
              </UserPreferencesProvider>
            </UserProfileProvider>
          </ToastProvider>
        </Router>
      </StrictMode>
    </PersistGate>
  </Provider>
);