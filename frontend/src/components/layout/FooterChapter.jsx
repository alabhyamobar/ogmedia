import React from 'react';
import InkText from '../ui/InkText';
import TypewriterText from '../ui/TypewriterText';
import UnfoldPanel from '../ui/UnfoldPanel';
import OgLogo from '../ui/OgLogo';

const SOCIAL_CHAPTERS = [
  {
    chapter: 'CHAPTER 02',
    name: 'Instagram',
    handle: '@ogmedia',
    url: 'https://instagram.com',
    accentColor: '#e1306c',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    )
  },
  {
    chapter: 'CHAPTER 03',
    name: 'X (Twitter)',
    handle: '@ogmedia',
    url: 'https://x.com',
    accentColor: '#000000',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    chapter: 'CHAPTER 04',
    name: 'Discord',
    handle: 'OG Syndicate',
    url: 'https://discord.com',
    accentColor: '#5865F2',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    )
  },
  {
    chapter: 'CHAPTER 05',
    name: 'YouTube',
    handle: 'OG Media Studios',
    url: 'https://youtube.com',
    accentColor: '#ef4444',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    )
  }
];

export default function FooterChapter() {
  return (
    <footer id="social-chapters" className="relative px-3 sm:px-6 pt-8 pb-12 max-w-[1300px] mx-auto select-none">
      <div className="text-center my-8 flex flex-col items-center">
        <div className="mb-6">
          <OgLogo size="lg" withText={true} subtitle="CREATIVE INTELLIGENCE STUDIO" />
        </div>
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

        <div className="mt-3">
          <div className="inline-block bg-[#39FF14] text-black border-2 border-black px-4 py-1 font-mono-tech font-bold text-xs sm:text-sm manga-shadow-sm">
            <span>[ TO BE CONTINUED IN VOL. 02 ... // </span>
            <span className="font-heading font-black text-black">CONTINUE ON SOCIALS</span>
            <span> ]</span>
          </div>
        </div>
      </div>

      <div className="my-8 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {SOCIAL_CHAPTERS.map((item) => (
            <a
              key={item.chapter}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              title={`${item.chapter}: Follow on ${item.name}`}
              className="group flex items-center gap-3 bg-white dark:bg-[#18181c] border-2 border-black dark:border-stone-700 hover:border-black px-4 sm:px-5 py-2.5 rounded-xl manga-shadow hover:shadow-[5px_5px_0px_#000] hover:-translate-y-1 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform flex-shrink-0"
                style={{ backgroundColor: item.accentColor }}
              >
                {item.icon}
              </div>

              <div className="text-left font-mono-tech">
                <div className="text-[10px] font-bold text-stone-500 dark:text-stone-400 group-hover:text-stone-800 dark:group-hover:text-stone-200 uppercase tracking-wider">
                  {item.chapter}
                </div>
                <div className="text-xs sm:text-sm font-bold text-black dark:text-white flex items-center gap-1 leading-tight">
                  <span>{item.name}</span>
                  <span className="text-[11px] text-stone-400 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <UnfoldPanel direction="right" duration={1000} delay={150} className="border-2 border-black dark:border-[#38383e] bg-white dark:bg-[#131316] p-6 my-8 manga-shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono-tech text-xs">
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

          <div className="border-l-3 border-[#39FF14] pl-3.5 bg-[#39FF14]/5 p-2">
            <InkText
              as="div"
              strokeWidth="1px"
              delay={250}
              duration={2000}
              className="font-bold text-[#65a30d] dark:text-[#39FF14] uppercase tracking-wider mb-1"
              text="NEW YORK TRANSMISSION"
            />
            <TypewriterText speed={15} delay={350} cursor={false} text="SoHo Creative Studio," />
            <div className="text-stone-500 dark:text-stone-400 font-medium">New York, NY</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left font-mono-tech text-[10px] text-stone-600 dark:text-stone-400">
          <div>
            OG MEDIA GROUP INC. // 2026 // GLOBAL PRODUCTION ARCHIVE #2087 // ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
            <span>DESIGN &amp; DEVELOPED BY</span>
            <a
              href="https://github.com/alabhyamobar"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-black dark:text-[#39FF14] hover:underline bg-stone-100 dark:bg-[#1e1e24] px-2 py-0.5 rounded border border-black/20 dark:border-stone-700 shadow-sm transition-colors"
            >
              @alabhyamobar
            </a>
          </div>
        </div>
      </UnfoldPanel>

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
