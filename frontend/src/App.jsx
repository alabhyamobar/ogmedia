import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import LoadingGame from './components/loading/LoadingGame';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';

const FooterChapter = lazy(() => import('./components/layout/FooterChapter'));
const FloatingThemeWidget = lazy(() => import('./components/layout/FloatingThemeWidget'));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename="/ogmedia">
          {/* Interactive Flappy Manga Loading Game */}
          {isLoading && (
            <LoadingGame onComplete={() => setIsLoading(false)} />
          )}

          <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#bef264] selection:text-black transition-colors duration-300 flex flex-col justify-between">
            <div>
              {/* Chronicle Edition Header & Theme Bar */}
              <Navbar />

              {/* Application Routes */}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage initialMode="login" />} />
                <Route path="/signup" element={<AuthPage initialMode="signup" />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>

            {/* End of Chapter 01 & Master Credits */}
            <Suspense fallback={null}>
              <FooterChapter />
              <FloatingThemeWidget />
            </Suspense>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
