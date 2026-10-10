import React from 'react';
import InkText from '../../ui/InkText';

/**
 * HeroActionFooter
 * Renders the comic sound effect ("SWOO-OOSH!") sticker, speed vector telemetry,
 * and the primary call-to-action button allowing users to dive into the visual window.
 */
export default function HeroActionFooter({
  swooshRef,
  ctaRef,
  onDive,
  isDark
}) {
  return (
    <div
      className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 pt-1 sm:pt-2 px-1 sm:px-4"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Dynamic Swoosh Comic SFX */}
      <div
        ref={swooshRef}
        aria-hidden="true"
        className="flex flex-col items-center sm:items-start select-none group cursor-help"
        style={{
          transform: 'translateZ(60px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <InkText
          as="div"
          strokeColor={isDark ? '#ffffff' : '#000000'}
          fillColor={isDark ? '#ffffff' : '#000000'}
          strokeWidth="0.5px"
          delay={400}
          duration={1800}
          className="font-heading text-2xl sm:text-5xl text-black dark:text-white font-normal tracking-wide leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
          text="SWOO-OOSH!"
        />
        <div
          className="bg-[#39FF14] text-black font-mono-tech font-extrabold text-[9px] sm:text-[11px] px-1.5 py-0.5 border border-black -mt-0.5 sm:-mt-1"
          style={{
            boxShadow: '2px 2px 0px #000000, 4px 4px 0px rgba(0,0,0,0.15)'
          }}
        >
          [SWOOSH: SPEED VECTOR]
        </div>
      </div>

      {/* Dive Trigger CTA */}
      <div
        ref={ctaRef}
        className="w-full sm:w-auto flex items-center justify-center gap-3"
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <button
          id="hero-dive-btn"
          type="button"
          onClick={onDive}
          aria-label="Scroll or tap to dive into 4K video window"
          className="w-full sm:w-auto justify-center bg-black dark:bg-[#18181c] hover:bg-stone-900 dark:hover:bg-black text-white font-mono-tech font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 border-2 border-black dark:border-stone-700 flex items-center gap-2 transition-all duration-200 active:translate-x-1 active:translate-y-1 cursor-pointer shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000]"
        >
          <span>SCROLL OR TAP TO DIVE INTO WINDOW</span>
          <span className="text-[#39FF14]" aria-hidden="true">↓</span>
        </button>
        <div
          className="bg-white dark:bg-[#18181c] text-stone-600 dark:text-stone-400 font-mono-tech text-xs px-3 py-2.5 border border-stone-300 dark:border-stone-700 hidden lg:block"
          style={{
            boxShadow: '3px 3px 0px rgba(0,0,0,0.15)'
          }}
          aria-hidden="true"
        >
          [SYS_PROMPT: 24 FRAMES LOADED]
        </div>
      </div>
    </div>
  );
}
