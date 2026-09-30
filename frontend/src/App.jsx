import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { VideoPreloadProvider } from './context/VideoPreloadContext';
import { AuthProvider } from './context/AuthContext';
import LoadingGame from './components/loading/LoadingGame';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// CRM Components & Pages
import ProtectedRoute from './components/crm/ProtectedRoute';
import CrmLayout from './layouts/CrmLayout';
import LoginPage from './pages/crm/LoginPage';
import DashboardPage from './pages/crm/DashboardPage';
import LeadsPage from './pages/crm/LeadsPage';
import LeadDetailPage from './pages/crm/LeadDetailPage';
import AnalyticsPage from './pages/crm/AnalyticsPage';
import EmployeesPage from './pages/crm/EmployeesPage';
import AuditLogsPage from './pages/crm/AuditLogsPage';
import SettingsPage from './pages/crm/SettingsPage';

const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const FooterChapter = lazy(() => import('./components/layout/FooterChapter'));
const FloatingThemeWidget = lazy(() => import('./components/layout/FloatingThemeWidget'));
const DevPaletteConsole = lazy(() => import('./components/dev/DevPaletteConsole'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function AppRoutes({ isLoading }) {
  const location = useLocation();
  const isCrmRoute = location.pathname.startsWith('/crm') || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#bef264] selection:text-black transition-colors duration-300 flex flex-col justify-between">
      <div>
        {!isCrmRoute && <Navbar />}

        <Routes>
          {/* Public Agency Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/service/:slug"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono-tech text-xs text-stone-500">
                    [ LOADING PROTOCOL SPECIFICATION... ]
                  </div>
                }
              >
                <ServiceDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/services/:slug"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center font-mono-tech text-xs text-stone-500">
                    [ LOADING PROTOCOL SPECIFICATION... ]
                  </div>
                }
              >
                <ServiceDetailPage />
              </Suspense>
            }
          />

          {/* CRM Authentication Routes */}
          <Route path="/crm/login" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected CRM App Routes */}
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CrmLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/crm/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute requireAdmin>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requireAdmin>
                  <AuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isCrmRoute && (
        <Suspense fallback={null}>
          <FooterChapter />
          {!isLoading && (
            <>
              <FloatingThemeWidget />
              <DevPaletteConsole />
            </>
          )}
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <VideoPreloadProvider>
            <BrowserRouter basename="/ogmedia">
              {isLoading && <LoadingGame onComplete={() => setIsLoading(false)} />}
              <AppRoutes isLoading={isLoading} />
            </BrowserRouter>
          </VideoPreloadProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
