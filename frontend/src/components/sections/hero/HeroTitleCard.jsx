import React from 'react';
import InkText from '../../ui/InkText';
import TypewriterText from '../../ui/TypewriterText';


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
          <div className="flex items-center justify-center gap-3.5 sm:gap-5 md:gap-6">

            <div className="relative group/logo flex-shrink-0">
              <div
                className="absolute inset-0 bg-[#39FF14]/40 rounded-xl sm:rounded-2xl blur-md sm:blur-lg opacity-60 group-hover/logo:opacity-100 transition-opacity"
                aria-hidden="true"
              />
              <img
                src="/ogmedia/assets/og_logo.webp"
                alt="OG Media official crowned crest emblem"
                width="96"
                height="96"
                loading="eager"
                fetchPriority="high"
                className="relative w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black dark:border-stone-700 bg-[#0A0A0A] p-1 sm:p-2 shadow-[3px_3px_0px_#000000] sm:shadow-[5px_5px_0px_#000000] group-hover/logo:scale-105 transition-transform"
              />
            </div>

 
            <h1 className="text-4xl sm:text-7xl md:text-8xl font-bold font-comic-title tracking-wider leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,0.15)] text-black dark:text-white m-0 p-0">
              <span className="sr-only">
                OG MEDIA — Creative Intelligence, Viral Marketing &amp; Brand Worldbuilding Studio
              </span>
              <InkText
                as="span"
                strokeColor={isDark ? '#ffffff' : '#000000'}
                fillColor={isDark ? '#ffffff' : '#000000'}
                strokeWidth="0.6px"
                delay={200}
                duration={2400}
                className="select-none"
                text="MEDIA"
              />
            </h1>
          </div>
        </div>


        <div className="block -mt-1 sm:-mt-2">
          <h2
            className="inline-block bg-black text-[#39FF14] px-3 sm:px-6 py-1 sm:py-1.5 font-mono-tech font-extrabold text-[10px] sm:text-sm md:text-base tracking-wider sm:tracking-widest uppercase border border-stone-800 dark:border-stone-700 cursor-default m-0"
            style={{
              boxShadow: '4px 4px 0px #000000, 8px 8px 0px rgba(0,0,0,0.3)'
            }}
          >
            <span className="sr-only">
              Where Art Meets Intelligence — Viral Marketing &amp; Creative Media Agency:{" "}
            </span>
            <InkText
              as="span"
              strokeColor="#39FF14"
              fillColor="#39FF14"
              strokeWidth="1px"
              delay={500}
              duration={2000}
              text="Where Art Meets Intelligence"
            />
          </h2>
        </div>


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
