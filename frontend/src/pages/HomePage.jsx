import React, { Suspense, lazy, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/sections/HeroSection';

const TrajectorySection = lazy(() => import('../components/sections/TrajectorySection'));
const ArsenalSection = lazy(() => import('../components/sections/ArsenalSection'));
const CollectorCoversSection = lazy(() => import('../components/sections/CollectorCoversSection'));
const ContactTransmissionSection = lazy(() => import('../components/sections/ContactTransmissionSection'));

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <main className="space-y-4">
      <HeroSection />
      <Suspense fallback={
        <div className="h-48 flex items-center justify-center font-mono-tech text-xs text-stone-500">
          [ LOADING ARCHIVE SECTORS... ]
        </div>
      }>
        <TrajectorySection />
        <ArsenalSection />
        <CollectorCoversSection />
        <ContactTransmissionSection />
      </Suspense>
    </main>
  );
}
