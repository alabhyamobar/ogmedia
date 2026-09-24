import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LoadingGame from './components/loading/LoadingGame';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

const FooterChapter = lazy(() => import('./components/layout/FooterChapter'));
const FloatingThemeWidget = lazy(() => import('./components/layout/FloatingThemeWidget'));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider>
      <BrowserRouter basename="/ogmedia">
        {isLoading && (
          <LoadingGame onComplete={() => setIsLoading(false)} />
        )}

        <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#bef264] selection:text-black transition-colors duration-300 flex flex-col justify-between">
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Suspense fallback={null}>
            <FooterChapter />
            <FloatingThemeWidget />
          </Suspense>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
