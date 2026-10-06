import React from 'react';
import InkText from '../../ui/InkText';
import TypewriterText from '../../ui/TypewriterText';

/**
 * HeroTitleCard
 * The primary brand and SEO anchor for the website.
 * Contains the crowned OG emblem, semantic <h1> with crawlable keyword text,
 * semantic <h2> subtitle, and crawlable value proposition paragraph.
 * Explicitly positioned to overlap in front of the video/manga panel in 3D perspective space.
 */
export default function HeroTitleCard({ titleCardRef, descRef, isDark }) {
  return (
    <div
      className="relative z-50 text-center -mt-8 sm:-mt-16 md:-mt-20 pointer-events-auto"
      style={{
        transform: 'translateZ(95px)',
        transformStyle: 'preserve-3d'
      }}
    >
      <header aria-label="Brand Title and Identity">
        <div
          ref={titleCardRef}
          className="inline-block border-3 border-black dark:border-[#38383e] px-5 sm:px-12 py-2 sm:py-3.5 transition-colors duration-300 cursor-default"
          style={{
            transform: 'translateZ(95px)',
            transformStyle: 'preserve-3d',
            backgroundColor: isDark ? '#16161a' : '#ffffff',
            boxShadow: isDark
              ? '8px 12px 0px #000000, 16px 20px 16px rgba(168,85,247,0.3)'
              : '8px 12px 0px #000000, 16px 20px 10px rgba(56,189,248,0.2)'
          }}
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Crowned OG Crest Logo */}
            <div className="relative group/logo">
              <div
                className="absolute inset-0 bg-[#39FF14]/40 rounded-xl blur-md opacity-60 group-hover/logo:opacity-100 transition-opacity"
                aria-hidden="true"
              />
              <img
                src="/ogmedia/assets/og_logo.png"
                alt="OG Media official crowned crest emblem"
                width="56"
                height="56"
                loading="eager"
                fetchPriority="high"
                className="relative w-9 h-9 sm:w-14 sm:h-14 object-contain rounded-xl border-2 border-black dark:border-stone-700 bg-[#0A0A0A] p-0.5 shadow-[2px_2px_0px_#000000] sm:shadow-[3px_3px_0px_#000000] group-hover/logo:scale-105 transition-transform"
              />
            </div>

            {/* Primary Semantic H1 with Screen-Reader / Crawler Keyword Enhancements */}
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-bold font-comic-title tracking-wider leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] text-black dark:text-white m-0 p-0">
              <span className="sr-only">
                OG MEDIA — Creative Intelligence, Viral Marketing &amp; Brand Worldbuilding Studio
              </span>
              <InkText
                as="span"
                strokeColor={isDark ? '#ffffff' : '#000000'}
                fillColor={isDark ? '#ffffff' : '#000000'}
                strokeWidth="1.4px"
                delay={200}
                duration={2400}
                className="select-none"
                text="OG MEDIA"
              />
            </h1>
          </div>
        </div>

        {/* Tagline / Subtitle Badge */}
        <div className="block -mt-1 sm:-mt-2">
          <h2 className="sr-only">Where Ideas Meet Impact — Viral Marketing &amp; Creative Media Agency</h2>
          <div
            className="inline-block bg-black text-[#39FF14] px-3 sm:px-6 py-1 sm:py-1.5 font-mono-tech font-extrabold text-[10px] sm:text-sm md:text-base tracking-wider sm:tracking-widest uppercase border border-stone-800 dark:border-stone-700 cursor-default"
            style={{
              boxShadow: '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)'
            }}
          >
            <InkText
              as="span"
              strokeColor="#39FF14"
              fillColor="#39FF14"
              strokeWidth="1px"
              delay={500}
              duration={2000}
              text="Where Ideas Meet Impact"
            />
          </div>
        </div>

        {/* Crawlable Description Paragraph with Typewriter Visual Effect */}
        <div ref={descRef} style={{ transform: 'translateZ(30px)' }}>
          <p className="sr-only">
            We turn bold ideas into unforgettable brands, scroll-stopping content, and digital experiences built to capture attention and drive growth.
          </p>
          <TypewriterText
            as="p"
            delay={750}
            speed={12}
            className="max-w-2xl mx-auto text-stone-800 dark:text-stone-300 font-medium text-xs sm:text-sm md:text-base leading-relaxed text-center mt-5 sm:mt-8 mb-3 sm:mb-6 px-2 sm:px-4"
            text="We turn bold ideas into unforgettable brands, scroll-stopping content, and digital experiences built to capture attention and drive growth."
          />
        </div>
      </header>
    </div>
  );
}
