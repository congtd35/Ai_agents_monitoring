import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './lib/store';
import './lib/i18n';
import './App.css';

// Components
import MainLayout from './components/Layout/MainLayout';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const { i18n } = useTranslation();
  const { theme: currentTheme, language, isAuthenticated } = useAuthStore();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = currentTheme === 'dark' ? 'dark' : '';
  }, [currentTheme]);

  // Apply language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Check authentication on app start
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token && !isAuthenticated) {
      // Set authenticated state if token exists
      const { setUser } = useAuthStore.getState();
      setUser({ id: 'temp' }); // Temporary user to mark as authenticated
    }
  }, [isAuthenticated]);

  const antdTheme = {
    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginForm />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterForm />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Projects />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div>Tasks Page (Coming Soon)</div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div>Analytics Page (Coming Soon)</div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div>Settings Page (Coming Soon)</div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;

