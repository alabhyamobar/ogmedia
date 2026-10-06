import React from 'react';

/**
 * HeroTelemetryBar
 * Renders the bottom drafting board telemetry bar showing scene timestamp and chapter marker.
 */
export default function HeroTelemetryBar({ telemetryRef }) {
  return (
    <div
      ref={telemetryRef}
      className="relative z-10 border-t border-black dark:border-stone-800 pt-2 sm:pt-2.5 mt-2 sm:mt-4 flex items-center justify-between font-mono-tech text-[9px] sm:text-xs text-stone-600 dark:text-stone-400 px-1"
      style={{ transform: 'translateZ(15px)' }}
      aria-label="Scene Status Telemetry"
    >
      <div>00:00:01 // SCENE_INIT</div>
      <div className="flex items-center gap-2" aria-hidden="true">
        <span className="tracking-widest text-black dark:text-white font-bold">•••</span>
        <div className="w-12 sm:w-16 h-1.5 bg-[#39FF14] border border-black dark:border-stone-700" />
      </div>
      <div>CHAPTER 00 : PROLOGUE FINISHED</div>
    </div>
  );
}
