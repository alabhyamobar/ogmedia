import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { VideoPreloadProvider } from './context/VideoPreloadContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/crm/ProtectedRoute';

// Route-level code splitting: CRM pages are only loaded when navigated to
const CrmLayout = lazy(() => import('./layouts/CrmLayout'));
const LoginPage = lazy(() => import('./pages/crm/LoginPage'));
const DashboardPage = lazy(() => import('./pages/crm/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/crm/LeadsPage'));
const LeadDetailPage = lazy(() => import('./pages/crm/LeadDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/crm/AnalyticsPage'));
const EmployeesPage = lazy(() => import('./pages/crm/EmployeesPage'));
const AuditLogsPage = lazy(() => import('./pages/crm/AuditLogsPage'));
const SettingsPage = lazy(() => import('./pages/crm/SettingsPage'));

// Lazy load non-critical site elements
const LoadingGame = lazy(() => import('./components/loading/LoadingGame'));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'));
const FooterChapter = lazy(() => import('./components/layout/FooterChapter'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const CrmFallback = () => (
  <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] flex flex-col items-center justify-center font-mono-tech select-none">
    <div className="border-2 border-black dark:border-stone-700 bg-white dark:bg-[#16161a] p-6 rounded-2xl shadow-[6px_6px_0px_#000] text-center space-y-3 max-w-sm">
      <div className="inline-block bg-[#39FF14] text-black font-extrabold text-xs px-3 py-1 border border-black rounded shadow-[2px_2px_0px_#000]">
        CRM PROTOCOL
      </div>
      <div className="text-xs font-bold text-stone-900 dark:text-stone-100 animate-pulse">
        [ INITIALIZING MODULE WORKSPACE... ]
      </div>
    </div>
  </div>
);

function AppRoutes({ isLoading }) {
  const location = useLocation();
  const isCrmRoute = location.pathname.startsWith('/crm') || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#39FF14] selection:text-black transition-colors duration-300 flex flex-col justify-between overflow-x-hidden w-full max-w-full">
      <div>
        {!isCrmRoute && <Navbar />}

        <Routes>
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

          <Route
            path="/crm/login"
            element={
              <Suspense fallback={<CrmFallback />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<CrmFallback />}>
                <LoginPage />
              </Suspense>
            }
          />

          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <Suspense fallback={<CrmFallback />}>
                  <CrmLayout />
                </Suspense>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/crm/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<CrmFallback />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="leads"
              element={
                <Suspense fallback={<CrmFallback />}>
                  <LeadsPage />
                </Suspense>
              }
            />
            <Route
              path="leads/:id"
              element={
                <Suspense fallback={<CrmFallback />}>
                  <LeadDetailPage />
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<CrmFallback />}>
                  <AnalyticsPage />
                </Suspense>
              }
            />
            <Route
              path="employees"
              element={
                <ProtectedRoute requireAdmin>
                  <Suspense fallback={<CrmFallback />}>
                    <EmployeesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="employees/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <Suspense fallback={<CrmFallback />}>
                    <EmployeesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="audit-logs"
              element={
                <ProtectedRoute requireDeveloper>
                  <Suspense fallback={<CrmFallback />}>
                    <AuditLogsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute requireDeveloper>
                  <Suspense fallback={<CrmFallback />}>
                    <SettingsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {!isCrmRoute && (
        <Suspense fallback={null}>
          <FooterChapter />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;

    if (path.includes('/crm') || path.includes('/login')) {
      return false;
    }

    return true;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <VideoPreloadProvider>
            <BrowserRouter basename="/ogmedia">
              {isLoading && (
                <Suspense fallback={null}>
                  <LoadingGame onComplete={() => setIsLoading(false)} />
                </Suspense>
              )}
              <AppRoutes isLoading={isLoading} />
            </BrowserRouter>
          </VideoPreloadProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
