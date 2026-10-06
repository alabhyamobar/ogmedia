import React from 'react';

/**
 * HeroBgCanvas
 * Provides background perspective drafting lines and camera viewfinder corner markings.
 * Marked with aria-hidden="true" to prevent noise in accessibility and SEO readers.
 */
export default function HeroBgCanvas({ bgRaysRef, cornerMarksRef, isDark }) {
  return (
    <>
      {/* Corner marks for comic draft layout */}
      <div ref={cornerMarksRef} className="contents" aria-hidden="true">
        <div
          className="absolute top-1.5 left-2 sm:top-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          + C_01
        </div>
        <div
          className="absolute top-1.5 right-2 sm:top-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          C_02 +
        </div>
        <div
          className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          + C_03
        </div>
        <div
          className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-600 dark:text-stone-400 select-none z-20 pointer-events-none"
          style={{ transform: 'translateZ(15px)' }}
        >
          C_04 +
        </div>
      </div>

      {/* Perspective background grid rays */}
      <div
        ref={bgRaysRef}
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{ transform: 'translateZ(-15px)' }}
      >
        <svg
          className="w-full h-full opacity-25 dark:opacity-15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0" y1="0" x2="100%" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.75" />
          <line x1="25%" y1="0" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="75%" y1="0" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="0" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="100%" y1="25%" x2="50%" y2="50%" stroke={isDark ? '#fff' : '#000'} strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>
      </div>
    </>
  );
}
