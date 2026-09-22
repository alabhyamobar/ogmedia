import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';

export default function FooterChapter() {
  return (
    <footer className="relative px-3 sm:px-6 pt-8 pb-12 max-w-[1300px] mx-auto">
      {/* Huge Bold Comic End Title Box */}
      <div className="text-center my-8">
        <div className="inline-block bg-black dark:bg-[#16161a] text-white px-8 sm:px-14 py-4 sm:py-5 border-3 border-black dark:border-[#38383e] manga-shadow-lg transform -rotate-0.5">
          <InkText
            as="h2"
            strokeColor="#ffffff"
            fillColor="#ffffff"
            strokeWidth="1.4px"
            delay={200}
            duration={2400}
            className="text-4xl sm:text-6xl md:text-7xl font-bold font-comic-title tracking-wider"
            text="END OF CHAPTER 01"
          />
        </div>

        {/* Sub-Pill Badge */}
        <div className="mt-3">
          <div className="inline-block bg-[#bef264] text-black border-2 border-black px-4 py-1 font-mono-tech font-bold text-xs sm:text-sm manga-shadow-sm">
            <span>[ TO BE CONTINUED IN VOL. 02 ... // </span>
            <span className="font-heading font-black text-black">NEXT DROP COMING SOON</span>
            <span> ]</span>
          </div>
        </div>
      </div>

      {/* 3-Column Studio Metadata Footer Grid with Horizontal Map Unroll Animation */}
      <UnfoldPanel direction="right" duration={1000} delay={150} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-6 my-8 manga-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-tech text-xs">
          {/* Column 1: Seoul HQ */}
          <div className="border-l-3 border-[#38bdf8] pl-3.5 bg-[#38bdf8]/5 p-2">
            <InkText
              as="div"
              strokeWidth="1px"
              delay={150}
              duration={2000}
              className="font-bold text-[#0284c7] dark:text-[#38bdf8] uppercase tracking-wider mb-1"
              text="HEADQUARTERS // STUDIO A"
            />
            <TypewriterText speed={15} delay={250} cursor={false} text="Gangnam Techno-Art Corridor 3," />
            <div className="text-stone-500 dark:text-stone-400 font-medium">Seoul, Republic of Korea</div>
          </div>

          {/* Column 2: Tokyo Lab */}
          <div className="border-l-3 border-[#ef4444] pl-3.5 bg-[#ef4444]/5 p-2">
            <InkText
              as="div"
              strokeWidth="1px"
              delay={200}
              duration={2000}
              className="font-bold text-[#ef4444] uppercase tracking-wider mb-1"
              text="STUDIO B // PRODUCTION LAB"
            />
            <TypewriterText speed={15} delay={300} cursor={false} text="Shibuya Creative Base 04," />
            <div className="text-stone-500 dark:text-stone-400 font-medium">Tokyo, Japan</div>
          </div>

          {/* Column 3: NY Transmission */}
          <div className="border-l-3 border-[#bef264] pl-3.5 bg-[#bef264]/5 p-2">
            <InkText
              as="div"
              strokeWidth="1px"
              delay={250}
              duration={2000}
              className="font-bold text-[#65a30d] dark:text-[#bef264] uppercase tracking-wider mb-1"
              text="NEW YORK TRANSMISSION"
            />
            <TypewriterText speed={15} delay={350} cursor={false} text="SoHo Creative Studio," />
            <div className="text-stone-500 dark:text-stone-400 font-medium">New York, NY</div>
          </div>
        </div>

        {/* Middle Copyright Registration Strip */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 text-center font-mono-tech text-[10px] text-stone-600 dark:text-stone-400">
          OG MEDIA GROUP INC. // 2026 // GLOBAL PRODUCTION ARCHIVE #2087 // ALL RIGHTS RESERVED
        </div>
      </UnfoldPanel>

      {/* Bottom Technical Status Bar */}
      <div className="border-t-2 border-black dark:border-stone-800 pt-4 flex flex-wrap items-center justify-between gap-4 font-mono-tech text-[10px] sm:text-[11px] text-stone-700 dark:text-stone-300">
        <div>
          <InkText
            as="div"
            strokeWidth="1px"
            delay={300}
            duration={2000}
            className="font-bold text-black dark:text-white"
            text="END OF VOLUME 01 // TO BE CONTINUED..."
          />
          <div className="text-stone-500 dark:text-stone-400 text-[9px] sm:text-[10px]">
            OG MEDIA CREATIVE PRODUCTIONS // TOKYO // SEOUL // SAN FRANCISCO // ALL RIGHTS RESERVED
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 px-2 py-0.5 border border-stone-400 dark:border-stone-700">
            [ 2026.09 ]
          </span>
          <span className="bg-black text-white px-2 py-0.5 border border-black dark:border-stone-700 font-bold">
            [ TYPE: MASTER ARCHIVE ]
          </span>
          <span className="text-black dark:text-white font-bold">
            PAGE: 06 / END
          </span>
        </div>
      </div>
    </footer>
  );
}

