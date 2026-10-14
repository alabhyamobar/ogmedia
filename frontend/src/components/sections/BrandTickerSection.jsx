import React from 'react';

const BRAND_LOGOS = [
  {
    id: 'nike',
    name: 'Nike',
    sector: 'Apparel & Culture',
    color: '#f43f5e',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M21.71 4.54c-3.69 3.52-9.4 8.24-14.7 10.9-2.02 1.01-4.04 1.1-4.59-.28-.35-.88.16-2.2 1.4-3.64 2.87-3.34 8.16-6.84 17.89-7.14-.04.05 0 .14 0 .16z" />
      </svg>
    )
  },
  {
    id: 'spotify',
    name: 'Spotify',
    sector: 'Audio Streaming',
    color: '#1DB954',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 5.524 4.477 10 10 10s10-4.476 10-10c0-5.523-4.477-10-10-10zm4.587 14.428a.625.625 0 01-.86.208c-2.357-1.44-5.323-1.766-8.817-.968a.624.624 0 11-.277-1.218c3.824-.874 7.1-.504 9.746 1.118a.626.626 0 01.208.86zm1.226-2.724a.782.782 0 01-1.077.257c-2.698-1.658-6.81-2.138-10-.116a.783.783 0 01-.83-1.328c3.65-2.28 8.196-1.74 11.25.14a.782.782 0 01.257 1.077zm.106-2.835C14.685 8.94 9.35 8.765 6.25 9.706a.937.937 0 11-.548-1.792c3.56-1.08 9.45-.883 13.208 1.346a.937.937 0 11-.99 1.595z" />
      </svg>
    )
  },
  {
    id: 'playstation',
    name: 'PlayStation',
    sector: 'Gaming & Interactive',
    color: '#0070D1',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M8.5 3v18l5-2.5V5.5L8.5 3zm6.5 6.5c-1.8 0-3.5.5-4.5 1.5l1.5 2c.6-.6 1.8-1 3-1 1.2 0 2 .5 2 1.2 0 .8-.8 1.2-2.5 1.8-2.5.8-4.5 2-4.5 4.5 0 2.5 2 4.5 5 4.5 2.2 0 4-.8 5-2l-1.5-2c-.8.8-2 1.5-3.5 1.5-1.5 0-2.2-.6-2.2-1.4 0-.8.8-1.2 2.5-1.8 2.5-.8 4.5-2 4.5-4.3 0-2.5-2-4.5-4.8-4.5z" />
      </svg>
    )
  },
  {
    id: 'redbull',
    name: 'Red Bull',
    sector: 'Extreme & Media',
    color: '#ef4444',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3c2.2 0 4.1 1 5.3 2.6-1.3.4-2.5 1.1-3.5 2-1-.9-2.2-1.6-3.5-2C11.5 6 12 5 12 5zm-7 8c1.6-1.8 3.8-3 6.3-3.2-.2.6-.3 1.2-.3 1.8 0 1.2.4 2.3 1 3.2-1.4.3-2.7 1-3.7 2-1.7-1-2.9-2.3-3.3-3.8zm14 0c-.4 1.5-1.6 2.8-3.3 3.8-1-1-2.3-1.7-3.7-2 .6-.9 1-2 1-3.2 0-.6-.1-1.2-.3-1.8 2.5.2 4.7 1.4 6.3 3.2z" />
      </svg>
    )
  },
  {
    id: 'discord',
    name: 'Discord',
    sector: 'Community Infrastructure',
    color: '#5865F2',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    )
  },
  {
    id: 'twitch',
    name: 'Twitch',
    sector: 'Live Broadcast',
    color: '#a855f7',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
      </svg>
    )
  },
  {
    id: 'razer',
    name: 'Razer',
    sector: 'Gaming Hardware',
    color: '#39FF14',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.8 14.5c-.8.6-2 .6-2.8 0l-3.2-2.4c-.4-.3-.6-.8-.5-1.3.1-.5.5-.9 1-.9h1.7v-3.5c0-.6.4-1 1-1s1 .4 1 1V12h1.7c.5 0 .9.4 1 .9.1.5-.1 1-.5 1.3l-3.4 2.3z" />
      </svg>
    )
  },
  {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    sector: 'Anime & Manga',
    color: '#f97316',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.4 14.8A6.2 6.2 0 1115.4 6.8a6.2 6.2 0 010 10zm-2.3-3.1A3.1 3.1 0 1113.1 8.3a3.1 3.1 0 010 5.4z" />
      </svg>
    )
  },
  {
    id: 'epicgames',
    name: 'Epic Games',
    sector: 'Unreal & Gaming',
    color: '#06b6d4',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2L4 5.5v5.5c0 5.5 3.5 10.5 8 11.5 4.5-1 8-6 8-11.5V5.5L12 2zm3.5 13.5h-7v-2h7v2zm1-4.5H7.5V9h9v2zm0-4.5H7.5V5.5h9V6.5z" />
      </svg>
    )
  },
  {
    id: 'netflix',
    name: 'Netflix',
    sector: 'Entertainment',
    color: '#E50914',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
        <path d="M5.398 0v24c1.868-.266 3.633-.645 5.302-1.139V0H5.398zm7.9 0l-5.6 17.5c1.785-.43 3.518-.962 5.2-1.589V0h.4zm5.3 0v13.5c1.68-.698 3.32-1.5 4.9-2.399V0h-4.9z" />
      </svg>
    )
  }
];

// Duplicate items to ensure a perfectly seamless infinite horizontal scroll loop
const TICKER_ITEMS = [...BRAND_LOGOS, ...BRAND_LOGOS];

export default function BrandTickerSection() {
  return (
    <section
      aria-label="Trusted Brands"
      className="relative py-3 sm:py-5 max-w-full overflow-hidden select-none my-2 sm:my-4"
    >
      {/* Background subtle panel strip */}
      <div className="absolute inset-x-0 inset-y-1 bg-stone-100/50 dark:bg-[#111114]/70 border-y border-stone-200/80 dark:border-stone-800/80 -z-10 pointer-events-none" />

      {/* Heading Line: Sleek, compact and strictly includes "TRUSTED BY 50+ BRANDS" */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-3 mb-2 sm:mb-3">
        <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1 max-w-[36px] sm:max-w-[90px]" />
        
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-0.5 bg-white dark:bg-[#16161a] border border-black/20 dark:border-stone-700 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
          <h3 className="font-mono-tech text-[10px] sm:text-xs font-bold tracking-wider uppercase text-stone-900 dark:text-stone-100">
            TRUSTED BY 50+ BRANDS
          </h3>
          <span className="text-stone-400 dark:text-stone-500 font-mono-tech text-[9px] sm:text-[10px] hidden xs:inline">
            // GLOBAL NETWORK
          </span>
        </div>

        <div className="h-px bg-stone-300 dark:bg-stone-800 flex-1 max-w-[36px] sm:max-w-[90px]" />
      </div>

      {/* Infinite Horizontal Scrolling Ticker with edge-fade gradient masks */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="animate-ticker flex items-center gap-2.5 sm:gap-3 py-0.5">
          {TICKER_ITEMS.map((brand, idx) => (
            <div
              key={`${brand.id}-${idx}`}
              className="group flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white dark:bg-[#16161a] border border-black/15 dark:border-stone-800 rounded-lg shadow-sm hover:border-black dark:hover:border-[#39FF14] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#39FF14] transition-all duration-150 flex-shrink-0 cursor-default"
            >
              <div
                className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-stone-700 dark:text-stone-300 transition-all duration-150 group-hover:scale-110 flex-shrink-0"
                style={{ color: brand.color }}
              >
                {brand.icon}
              </div>

              <div className="flex flex-col text-left">
                <span className="font-mono-tech font-bold text-[11px] sm:text-xs tracking-wider text-black dark:text-stone-200 uppercase whitespace-nowrap leading-tight">
                  {brand.name}
                </span>
                <span className="font-mono-tech text-[8px] sm:text-[9px] text-stone-600 dark:text-stone-400 tracking-tight uppercase whitespace-nowrap leading-tight">
                  {brand.sector}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
