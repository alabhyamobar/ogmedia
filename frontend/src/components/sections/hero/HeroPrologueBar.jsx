import React from 'react';
import InkText from '../../ui/InkText';
import TypewriterText from '../../ui/TypewriterText';

/**
 * HeroPrologueBar
 * Renders the top narrative prologue panel and brand mission typewriter badge.
 * Provides accessible markup for screen readers and SEO spiders.
 */
export default function HeroPrologueBar({ prologueRef, limeBoxRef, isDark }) {
  return (
    <div
      className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 pt-1 sm:pt-4 px-1 sm:px-4 mb-3 sm:mb-6"
      style={{ transformStyle: 'preserve-3d' }}
      aria-label="Prologue and Mission Overview"
    >
      {/* Narrative prologue dialogue box */}
      <div
        ref={prologueRef}
        className="border-2 border-black dark:border-[#38383e] p-2.5 sm:p-4 max-w-full sm:max-w-sm transition-colors duration-300 cursor-default"
        style={{
          backgroundColor: isDark ? '#18181c' : '#ffffff',
          transform: 'translateZ(45px) rotate(-1deg)',
          boxShadow: isDark
            ? '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)'
            : '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.12)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="flex items-center gap-1.5 font-mono-tech text-[9px] sm:text-xs font-bold text-stone-800 dark:text-stone-300 uppercase mb-0.5 sm:mb-1">
          <span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#ef4444]" aria-hidden="true" />
          <span>NARRATIVE PROLOGUE:</span>
        </div>
        <InkText
          as="p"
          strokeColor={isDark ? '#ffffff' : '#000000'}
          fillColor={isDark ? '#ffffff' : '#000000'}
          strokeWidth="0.4px"
          delay={200}
          duration={1800}
          className="font-heading font-normal text-xs sm:text-base md:text-lg tracking-wide text-black dark:text-white m-0"
          text='"THIS IS NOT JUST A WEBSITE."'
        />
      </div>

      {/* Brand mission typewriter badge */}
      <div
        ref={limeBoxRef}
        className="bg-[#39FF14] border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 font-mono-tech font-bold text-[11px] sm:text-sm text-black flex items-center gap-1.5 flex-wrap cursor-default self-start sm:self-auto"
        style={{
          transform: 'translateZ(45px) rotate(1deg)',
          boxShadow: isDark
            ? '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.35)'
            : '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.12)',
          transformStyle: 'preserve-3d'
        }}
      >
        <TypewriterText
          as="span"
          speed={14}
          delay={200}
          cursor={false}
          text="WE BUILD THE VISION."
        />
        <span className="hidden sm:inline" aria-hidden="true">//</span>
        <span className="font-heading font-normal tracking-wider text-black hidden sm:inline">
          YOU OWN THE IMPACT.
        </span>
      </div>
    </div>
  );
}
