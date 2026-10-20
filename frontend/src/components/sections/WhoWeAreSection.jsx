import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function WhoWeAreSection() {
  return (
    <section
      id="story"
      className="relative px-3 sm:px-6 py-10 sm:py-14 max-w-[1280px] mx-auto select-none overflow-x-hidden sm:overflow-x-visible"
    >
      <div id="who-we-are" className="absolute -top-24 left-0 pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 relative px-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono-tech text-xs sm:text-sm font-bold text-stone-700 dark:text-stone-300">
            <span className="text-stone-500">/// 00</span>
            <span className="font-jp-impact text-black dark:text-white tracking-wider text-sm sm:text-base">
              原点.
            </span>
            <span className="bg-[#ef4444] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-0.5 border border-black dark:border-stone-800 uppercase shadow-sm">
              CHAPTER 00 // ORIGIN
            </span>
          </div>

          <div className="relative inline-block">
            <InkText
              as="h2"
              text="The Story — Who We Are"
              strokeWidth="0.4px"
              fontWeight={400}
              delay={120}
              duration={2000}
              className="font-brush text-3xl sm:text-4xl md:text-5xl lg:text-6xl italic tracking-wide text-black dark:text-white uppercase leading-none drop-shadow-sm font-normal"
            />
            <span className="absolute -left-2 -right-4 bottom-1 sm:bottom-2 h-[45%] bg-[#39FF14] -z-10 -rotate-1 skew-x-[-14deg] rounded-sm shadow-sm pointer-events-none" />
          </div>

          <div className="mt-2.5 inline-block">
            <div className="font-mono-tech text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 uppercase tracking-wider space-y-0.5">
              <div>Where Art Meets Creative Intelligence.</div>
              <div>We Build Worlds &amp; Make Brands Impossible To Ignore.</div>
            </div>
            <div className="w-16 h-1 bg-gradient-to-r from-[#f43f5e] via-[#ec4899] to-transparent rounded-full mt-1 transform -rotate-1" />
          </div>
        </div>

        <div className="self-end md:mr-6 flex flex-col items-center select-none transform rotate-[-2deg]">
          <div className="font-handwriting text-xl sm:text-2xl text-stone-800 dark:text-stone-200 font-bold tracking-wide">
            <span>Studio genesis</span>
          </div>
          <div className="font-handwriting text-base sm:text-lg text-stone-600 dark:text-stone-400 -mt-0.5 font-bold">
            who we are
          </div>
          <svg
            className="w-8 h-6 text-stone-800 dark:text-stone-200 transform translate-x-2 -rotate-12 stroke-current"
            viewBox="0 0 60 40"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 8 Q 38 4, 46 28" />
            <path d="M38 24 L 46 28 L 46 18" />
          </svg>
        </div>
      </div>

      {/* Grid: On mobile Image panel is order-1 (above), Text panel is order-2 (below). On desktop Text is left, Image is right. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Text Panel: order-2 on mobile, order-1 on desktop */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col">
          <UnfoldPanel direction="right" duration={1000} delay={150} className="rounded-2xl sm:rounded-3xl h-full">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-4 sm:p-5 rounded-2xl sm:rounded-3xl manga-shadow hover:manga-shadow-lg transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between font-mono-tech text-[10px] pb-1.5 mb-2.5 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] px-2.5 py-1 rounded-lg text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[#ef4444] dark:text-[#f43f5e]">
                      PRIMARY ARCHIVE // ORIGIN MANIFESTO
                    </span>
                    <span className="bg-black text-[#39FF14] px-1.5 py-0.5 rounded text-[9px] font-bold">
                      DOSSIER
                    </span>
                  </div>
                  <span className="hidden sm:inline font-mono-tech text-[9px] font-bold text-stone-500 dark:text-stone-400">
                    CORE IDENTITY
                  </span>
                </div>

                <div className="text-stone-500 dark:text-stone-400 font-mono-tech text-[10px] font-bold mb-0.5">
                  [ PRIMARY REPORT // ARCHIVE - 01 ]
                </div>

                <InkText
                  as="h3"
                  strokeWidth="0.4px"
                  fontWeight={400}
                  delay={200}
                  duration={2000}
                  className="text-xl sm:text-2xl md:text-3xl font-normal font-heading text-black dark:text-white mb-2.5 tracking-wide uppercase leading-tight"
                  text='"WE MAKE BRANDS IMPOSSIBLE TO IGNORE."'
                />

                <TypewriterText
                  speed={12}
                  delay={350}
                  className="text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed font-normal mb-3 sm:mb-4"
                  text="It began as a small squad with big ideas and zero patience for boring. Now we write the whole storyline: the posts that go viral, the press that makes headlines, the ads that hit the target, and the behind-the-scenes grind nobody sees. Brands enter as Level 1. They exit as the main character."
                />

                {/* Compact Pillars */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-stone-200 dark:border-stone-800">
                  <div className="bg-white dark:bg-[#1f1f25] border border-black dark:border-stone-700 rounded-lg p-2 manga-shadow-sm">
                    <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold text-[#0284c7] dark:text-[#38bdf8] uppercase">
                      01 // CULTURE
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white font-heading truncate">
                      VIRAL REACH
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1f1f25] border border-black dark:border-stone-700 rounded-lg p-2 manga-shadow-sm">
                    <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold text-[#39FF14] uppercase">
                      02 // MEDIA
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white font-heading truncate">
                      TARGETED ADS
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#1f1f25] border border-black dark:border-stone-700 rounded-lg p-2 manga-shadow-sm">
                    <div className="font-mono-tech text-[8px] sm:text-[9px] font-bold text-[#f59e0b] uppercase">
                      03 // DESIGN
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-black dark:text-white font-heading truncate">
                      WORLDBUILDING
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono-tech text-[9px] pt-2 mt-3 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                  <span>CULTURE MEETS INTELLIGENCE</span>
                </div>
                <span className="font-bold text-[#ef4444] uppercase">STUDIO ARCHIVE</span>
              </div>
            </div>
          </UnfoldPanel>
        </div>

        {/* Image Panel (Panel 01-B): order-1 on mobile, order-2 on desktop */}
        <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col">
          <UnfoldPanel direction="right" duration={1100} delay={200} className="rounded-2xl sm:rounded-3xl h-full">
            <div className="border-[2.5px] border-black dark:border-[#38383e] bg-[#faf8f5] dark:bg-[#16161a] p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl manga-shadow hover:manga-shadow-lg transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between font-mono-tech text-[10px] pb-1.5 mb-2 border-b-2 border-black dark:border-stone-700 bg-white dark:bg-[#1e1e24] px-2.5 py-1 rounded-lg text-stone-700 dark:text-stone-300">
                  <span className="font-bold text-[#ef4444]">
                    PANEL 01-B // HARD CUT FOCUS
                  </span>
                  <span className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-bold px-1.5 py-0.5 rounded border border-black dark:border-stone-800 text-[8px] sm:text-[9px] shadow-sm">
                    CORE // 02
                  </span>
                </div>

                <div className="relative w-full border-2 border-black dark:border-stone-800 rounded-xl overflow-hidden bg-stone-950 aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/11] h-[240px] sm:h-[290px] lg:h-[310px] shadow-inner">
                  <img
                    src="/ogmedia/assets/akashhero.webp"
                    alt="Akash hero illustration"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top sm:object-center transition-transform duration-500 hover:scale-105"
                  />

                  <div className="absolute top-2 right-2 z-20">
                    <div className="bg-gradient-to-r from-[#39FF14] to-[#10b981] text-black border border-black font-mono-tech text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded manga-shadow-sm shadow-[0_0_8px_rgba(190,242,100,0.4)]">
                      SOLO LEVELING // LV.99
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 z-20">
                    <div className="bg-white/95 dark:bg-[#18181c]/95 text-black dark:text-white border border-[#ef4444] dark:border-[#f43f5e] px-2.5 py-1.5 rounded-lg text-xs font-mono-tech manga-shadow shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      <div className="text-[#ef4444] text-[9px] font-bold">[ DIALOGUE 01-B // LEAD ARTIST ]</div>
                      <InkText
                        as="div"
                        strokeWidth="0.35px"
                        fontWeight={400}
                        delay={300}
                        duration={2000}
                        className="font-normal text-black dark:text-white text-xs sm:text-sm tracking-wide font-heading mt-0.5"
                        text='"WE BUILD WORLDS."'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between font-mono-tech text-[9px] pt-1.5 mt-2 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                <span>ENERGY: OVERDRIVE</span>
                <span className="font-bold text-[#ef4444]">MAXIMUM FOCUS</span>
              </div>
            </div>
          </UnfoldPanel>
        </div>
      </div>
    </section>
  );
}
