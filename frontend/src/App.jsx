import React, { useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoadingGame from './components/loading/LoadingGame';
import TopTechnicalBar from './components/layout/TopTechnicalBar';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/sections/HeroSection';

// Lazy-load below-the-fold sections for low-latency initial render
const TrajectorySection = lazy(() => import('./components/sections/TrajectorySection'));
const ArsenalSection = lazy(() => import('./components/sections/ArsenalSection'));
const CollectorCoversSection = lazy(() => import('./components/sections/CollectorCoversSection'));
const ContactTransmissionSection = lazy(() => import('./components/sections/ContactTransmissionSection'));
const FooterChapter = lazy(() => import('./components/layout/FooterChapter'));
const FloatingThemeWidget = lazy(() => import('./components/layout/FloatingThemeWidget'));

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider>
      {/* Interactive Flappy Manga Loading Game */}
      {isLoading && (
        <LoadingGame onComplete={() => setIsLoading(false)} />
      )}

      <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans selection:bg-[#bef264] selection:text-black transition-colors duration-300">
        {/* Top Technical Protocol Status Bar */}
        <TopTechnicalBar onOpenGame={() => setIsLoading(true)} />

        {/* Chronicle Edition Header & Theme Bar */}
        <Navbar />

        {/* Main Manga/Manhwa Archive Sections */}
        <main className="space-y-4">
          <HeroSection />
          <Suspense fallback={<div className="h-48 flex items-center justify-center font-mono-tech text-xs text-stone-500">[ LOADING ARCHIVE SECTORS... ]</div>}>
            <TrajectorySection />
            <ArsenalSection />
            <CollectorCoversSection />
            <ContactTransmissionSection />
          </Suspense>
        </main>

        {/* End of Chapter 01 & Master Credits */}
        <Suspense fallback={null}>
          <FooterChapter />
          <FloatingThemeWidget />
        </Suspense>
      </div>
    </ThemeProvider>
  );
}


