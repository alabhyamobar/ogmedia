import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function TrajectorySection() {
  return (
    <section id="story" className="relative px-3 sm:px-6 py-10 max-w-[1300px] mx-auto">
      {/* Section Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 pb-2 border-b-2 border-black dark:border-[#38383e]">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="bg-[#ef4444] text-white font-mono-tech text-xs font-bold px-2.5 py-0.5 border border-black dark:border-stone-800 uppercase">
            CHAPTER 01 // THE TRAJECTORY
          </span>
          <InkText
            as="h2"
            strokeWidth="1.2px"
            delay={150}
            duration={2200}
            className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading tracking-tight text-black dark:text-white"
            text="THE STORY — BEYOND STATIC PIXELS"
          />
        </div>

        <div className="text-right font-mono-tech text-[10px] sm:text-xs text-stone-600 dark:text-stone-400 hidden md:block">
          <div>[ ED. NOTE: PANEL 01A — NARRATIVE AND SCALE OVERHAUL ]</div>
          <div className="font-bold text-black dark:text-white">SERIAL PAGE: 02 // THE MANHWA PHILOSOPHY</div>
        </div>
      </div>

      {/* Comic Panels Grid: 2-column asymmetric comic book spread with unfolding page animations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side (Col 1-7): Panel 01-A Wide Perspective */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Panel 01-A Frame with Canvas Unroll */}
          <UnfoldPanel direction="right" duration={1100} delay={150} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-2 manga-shadow">
            {/* Panel Top Info Strip */}
            <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-1.5 mb-1.5 border-b border-black dark:border-[#27272a] text-stone-700 dark:text-stone-300">
              <span className="font-bold text-[#0284c7] dark:text-[#38bdf8]">
                PANEL 01-A // GRID: WIDE PERSPECTIVE - 01ST
              </span>
              <span className="bg-[#38bdf8] text-black font-black px-2 py-0.5 border border-black text-[9px] shadow-sm">
                SCENE ACTIVE // CYAN TRANSMISSION
              </span>
            </div>

            {/* Panel Image Container */}
            <div className="relative border-2 border-black dark:border-stone-800 overflow-hidden bg-stone-950 aspect-[16/10] sm:aspect-[16/9]">
              <img
                src="/assets/story_warrior.jpg"
                alt="Warrior overlooking futuristic metropolis"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />

              {/* Halftone / Screentone Texture */}
              <div className="absolute inset-0 manga-halftone-light opacity-25 pointer-events-none" />

              {/* Top-Left English SFX (WAAAHHH!) */}
              <div className="absolute top-3 left-3 z-20 group cursor-help">
                <div className="bg-gradient-to-r from-amber-300 to-yellow-400 dark:from-amber-400 dark:to-yellow-500 border-2 border-black px-2.5 py-0.5 manga-shadow-sm transform -rotate-3">
                  <InkText
                    as="span"
                    strokeWidth="1.2px"
                    delay={250}
                    duration={2000}
                    className="font-heading text-xl sm:text-2xl text-black font-black tracking-wider"
                    text="WAAAHHH!"
                  />
                </div>
                {/* Tooltip */}
                <div className="absolute left-0 top-full mt-1 w-44 bg-black text-white text-[10px] font-mono-tech p-2 border border-stone-600 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                  <div className="text-[#bef264] font-bold">SFX: WAAAHHH!</div>
                  <div className="text-stone-300">Resonant warrior battle roar</div>
                </div>
              </div>

              {/* Bottom Dialogue Box */}
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20">
                <div className="bg-black text-white border-2 border-[#38bdf8] px-3 py-2 text-xs sm:text-sm font-mono-tech manga-shadow shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                  <div className="text-[#38bdf8] text-[10px] font-bold">[ DIALOGUE 01-A // DIRECTOR ]</div>
                  <InkText
                    as="div"
                    strokeColor="#ffffff"
                    fillColor="#ffffff"
                    strokeWidth="1.2px"
                    delay={400}
                    duration={2000}
                    className="font-bold text-white text-xs sm:text-sm tracking-wide"
                    text='"WE DON&apos;T JUST CREATE CONTENT."'
                  />
                </div>
              </div>
            </div>

            {/* Panel Footer Specs */}
            <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] pt-1.5 mt-1.5 border-t border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <TypewriterText speed={15} delay={300} cursor={false} text="RES: 3840 x 2160 // 120 FPS" />
              <span className="font-bold text-[#38bdf8]">ANGLE: LOW PERSPECTIVE TILT</span>
            </div>
          </UnfoldPanel>

          {/* Under-Panel Dialogue Box with Canvas Unroll */}
          <UnfoldPanel direction="right" duration={1000} delay={250} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-4 manga-shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-black text-[#bef264] font-mono-tech text-[10px] font-bold px-2 py-0.5 border border-stone-800">
                PANEL 01-C [ CORE NARRATIVE ]
              </span>
            </div>
            <InkText
              as="h3"
              strokeWidth="1.2px"
              delay={200}
              duration={2000}
              className="text-xl sm:text-2xl font-bold font-heading text-black dark:text-white mb-2"
              text="WE MAKE PEOPLE STOP SCROLLING."
            />
            <TypewriterText
              speed={14}
              delay={400}
              className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed min-h-[3em]"
              text="In a world of continuous feeds, every campaign must hit like a double-page spread awakening. We turn fleeting attention into obsessive immersion."
            />
          </UnfoldPanel>
        </div>

        {/* Right Side (Col 8-12): Panel 01-B Solo Leveling Core Focus */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Panel 01-B Frame with Canvas Unroll */}
          <UnfoldPanel direction="right" duration={1100} delay={200} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-2 manga-shadow">
            {/* Panel Top Info Strip */}
            <div className="flex items-center justify-between font-mono-tech text-[10px] sm:text-xs pb-1.5 mb-1.5 border-b border-black dark:border-[#27272a] text-stone-700 dark:text-stone-300">
              <span className="font-bold text-[#ef4444]">
                PANEL 01-B // HARD CUT FOCUS
              </span>
              <span className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-bold px-2 py-0.2 border border-black dark:border-stone-800 text-[9px] shadow-sm">
                CORE // 02
              </span>
            </div>

            {/* Panel Image Container */}
            <div className="relative border-2 border-black dark:border-stone-800 overflow-hidden bg-stone-950 aspect-[4/5]">
              <img
                src="/assets/story_hunter.jpg"
                alt="Manhwa hunter hero with green glowing aura"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
              />

              {/* Top-Right Badge: Solo Leveling Aesthetic */}
              <div className="absolute top-2.5 right-2.5 z-20">
                <div className="bg-gradient-to-r from-[#bef264] to-[#10b981] text-black border border-black font-mono-tech text-[9px] font-black px-2.5 py-0.5 manga-shadow-sm shadow-[0_0_10px_rgba(190,242,100,0.4)]">
                  SOLO LEVELING AESTHETIC // LV.99
                </div>
              </div>

              {/* Bottom Dialogue Box */}
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <div className="bg-white dark:bg-[#18181c] text-black dark:text-white border-2 border-[#ef4444] dark:border-[#f43f5e] px-3 py-2 text-xs sm:text-sm font-mono-tech manga-shadow shadow-[0_0_12px_rgba(239,68,68,0.25)]">
                  <div className="text-[#ef4444] text-[10px] font-bold">[ DIALOGUE 01-B // LEAD ARTIST ]</div>
                  <InkText
                    as="div"
                    strokeWidth="1.2px"
                    delay={300}
                    duration={2000}
                    className="font-bold text-black dark:text-white text-sm sm:text-base tracking-tight font-heading"
                    text='"WE BUILD WORLDS."'
                  />
                </div>
              </div>
            </div>

            {/* Panel Footer Specs */}
            <div className="flex items-center justify-between font-mono-tech text-[9px] sm:text-[10px] pt-1.5 mt-1.5 border-t border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              <span>ENERGY: CORE OVERDRIVE</span>
              <span className="font-bold text-[#ef4444]">STATUS: MAXIMUM FOCUS</span>
            </div>
          </UnfoldPanel>

          {/* Under-Panel Dialogue Box with Canvas Unroll */}
          <UnfoldPanel direction="right" duration={1000} delay={300} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-4 manga-shadow-sm">
            <div className="text-stone-500 dark:text-stone-400 font-mono-tech text-[10px] font-bold mb-1">
              [ SECONDARY REPORT // ARCHIVE - 02 ]
            </div>
            <InkText
              as="h3"
              strokeWidth="1.2px"
              delay={200}
              duration={2000}
              className="text-lg sm:text-xl font-bold font-heading text-black dark:text-white mb-2"
              text='"WE TURN IDEAS INTO UNFORGETTABLE EXPERIENCES."'
            />
            <TypewriterText
              speed={14}
              delay={400}
              className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed min-h-[3em]"
              text="From brand to global cultural footprint, our creative frameworks merge comic-paced storytelling with ultra-premium web craft."
            />
          </UnfoldPanel>
        </div>
      </div>

      {/* Storyboard Engine Footer Strip */}
      <div className="mt-6 border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-mono-tech text-[10px] sm:text-xs">
        <div className="text-stone-600 dark:text-stone-400">
          L/R: CHROMATIC 3D // FOUR VARIABLE SAMPLERS
        </div>
        <div className="text-stone-900 dark:text-stone-200 font-bold">
          STORYBOARDING ENGINE // CELL NO. 23 // TOTAL CELLS: 104 LOADED
        </div>
        <div className="bg-[#bef264] text-black font-bold px-3 py-1 border border-black uppercase text-[10px]">
          READY TO LINK
        </div>
      </div>
    </section>
  );
}

