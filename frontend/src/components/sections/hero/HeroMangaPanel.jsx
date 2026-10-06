import React from 'react';
import UnfoldPanel from '../../ui/UnfoldPanel';

/**
 * HeroMangaPanel
 * Renders the central manga drafting panel window, featuring the high-priority hero image,
 * halftone comic shading, archive perspective telemetry badges, and interactive dive trigger.
 * Built with semantic HTML (<figure>, <figcaption>, descriptive alt tags) for SEO excellence.
 */
export default function HeroMangaPanel({
  panelFrameRef,
  comicImageRef,
  frameBadgesRef,
  onDive,
  isDark
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDive(e);
    }
  };

  return (
    <figure
      className="relative z-10 m-0 p-0"
      style={{
        transform: 'translateZ(25px)',
        transformStyle: 'preserve-3d'
      }}
    >
      <figcaption className="sr-only">
        OG Media Creative Intelligence - Neo-Seoul interactive visual window archive 001_A
      </figcaption>

      <UnfoldPanel direction="right" duration={1.2} delay={0.15}>
        <div
          ref={panelFrameRef}
          onClick={onDive}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Dive into OG Media 4K video window"
          title="Tap or scroll down to dive into window"
          className="relative border-3 border-black dark:border-[#38383e] overflow-hidden bg-black aspect-[16/10] sm:aspect-[2.35/1] w-full transition-shadow duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#39FF14]"
          style={{
            boxShadow: isDark
              ? '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.4)'
              : '6px 6px 0px #000000, 12px 12px 0px rgba(0,0,0,0.14)'
          }}
        >
          {/* Main Visual Comic Image with Priority Preload Attributes */}
          <img
            ref={comicImageRef}
            src="/ogmedia/assets/hero_city.webp"
            alt="OG Media Creative Intelligence - Neo-Seoul interactive visual window showcase"
            width="1200"
            height="510"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-700 group-hover:scale-105"
          />

          {/* Halftone texture overlay */}
          <div
            className="absolute inset-0 manga-halftone-light opacity-20 pointer-events-none"
            aria-hidden="true"
          />

          {/* Perspective & Frame Telemetry Badges */}
          <div ref={frameBadgesRef} className="contents">
            <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20">
              <div className="bg-white/95 dark:bg-black/90 text-black dark:text-white border border-black dark:border-stone-700 px-2 py-0.5 sm:px-2.5 sm:py-0.5 font-mono-tech font-bold text-[8px] sm:text-[11px] shadow-sm">
                <span className="sm:hidden">FRAME: 001_A</span>
                <span className="hidden sm:inline">FRAME: ARCHIVE_001_A // OVERVIEW PERSPECTIVE</span>
              </div>
            </div>

            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20">
              <span className="bg-[#39FF14] text-black font-mono-tech font-bold text-[8px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 sm:py-0.5 border border-black shadow-sm flex items-center gap-1 group-hover:scale-105 transition-transform">
                <span aria-hidden="true">▶</span>
                <span className="hidden sm:inline">WATCH 4K STREAM</span>
                <span className="sm:hidden">4K PLAY</span>
              </span>
            </div>

            <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-3 z-20">
              <span className="bg-black/85 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[#39FF14] font-mono-tech font-bold text-[8px] sm:text-xs tracking-wider border border-black/40">
                SEOUL GRID: SECTOR 07
              </span>
            </div>
          </div>
        </div>
      </UnfoldPanel>
    </figure>
  );
}
