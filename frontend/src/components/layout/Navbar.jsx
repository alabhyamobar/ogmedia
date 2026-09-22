import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <nav className="w-full bg-[#e5e5dc] dark:bg-[#121215] border-b-2 border-black dark:border-[#27272a] sticky top-0 z-40 px-3 sm:px-6 py-2 transition-colors duration-300">
      <div className="max-w-[1300px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Edition Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-black text-[#38bdf8] font-mono-tech font-bold text-xs sm:text-sm px-2.5 py-1 tracking-wider border-2 border-[#38bdf8]/60 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
            CHRONICLE EDITION // ARCHIVE ISSUE 01
          </div>
          <div className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-1 tracking-tight uppercase border-2 border-black dark:border-stone-800 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            LIMITED FIRST EDITION // 01 / 100
          </div>
        </div>

        {/* Right Side: Theme Toggle Button & Nav links */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Main Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title="Toggle between Dark Noir and Light Draft modes"
            className="flex items-center gap-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-bold text-xs px-3 py-1.5 border-2 border-black manga-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[0_0_10px_rgba(190,242,100,0.3)]"
          >
            <span className="text-sm">{isDark ? '☾' : '☼'}</span>
            <span className="hidden sm:inline">THEME:</span>
            <span className="bg-black text-[#bef264] px-2 py-0.5 rounded text-[10px] uppercase font-mono-tech font-bold">
              {isDark ? 'DARK NOIR' : 'LIGHT DRAFT'}
            </span>
            <span className="text-[10px] text-stone-900 bg-white/70 px-1.5 py-0.2 rounded font-mono-tech hidden md:inline">
              {isDark ? 'SWITCH TO LIGHT ☼' : 'SWITCH TO DARK ☾'}
            </span>
          </button>

          {/* Nav chapter anchors with vibrant color-coded states */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono-tech text-xs font-bold">
            <a
              href="#story"
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#38bdf8] hover:text-black dark:hover:bg-[#38bdf8] dark:hover:text-black px-2.5 py-1 border border-black transition-all hover:scale-105"
            >
              [ 01 STORY ]
            </a>
            <a
              href="#arsenal"
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#a855f7] hover:text-white dark:hover:bg-[#a855f7] dark:hover:text-white px-2.5 py-1 border border-black transition-all hover:scale-105"
            >
              [ 02 ARSENAL ]
            </a>
            <a
              href="#covers"
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#f59e0b] hover:text-black dark:hover:bg-[#f59e0b] dark:hover:text-black px-2.5 py-1 border border-black transition-all hover:scale-105"
            >
              [ 03 COVERS ]
            </a>
            <a
              href="#contact"
              className="bg-black text-white hover:bg-[#ef4444] px-2.5 py-1 border border-black dark:border-stone-700 transition-all hover:scale-105"
            >
              [ 04 TRANSMISSION ]
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

