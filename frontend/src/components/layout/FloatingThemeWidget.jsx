import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function FloatingThemeWidget() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
      {showInfo && (
        <div className="bg-black dark:bg-[#18181b] text-white p-3 border-2 border-white dark:border-[#bef264] manga-shadow max-w-xs text-xs font-mono-tech mb-1 animate-fadeIn">
          <div className="flex justify-between items-center text-[#bef264] font-bold border-b border-stone-700 pb-1 mb-1">
            <span>⚡ THEME CONTROLLER</span>
            <button
              onClick={() => setShowInfo(false)}
              className="text-white hover:text-red-400 font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-stone-300 text-[11px] leading-relaxed">
            {isDark
              ? 'Currently in DARK NOIR mode: High-contrast cyberpunk webtoon aesthetic with deep blacks, electric lime, and crimson accents.'
              : 'Currently in LIGHT DRAFT mode: Authentic technical manga drafting paper aesthetic with ink hatching and screentone grid.'}
          </p>
          <div className="mt-2 text-[#bef264] text-[10px] font-bold">
            Click button below to toggle theme anytime!
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowInfo(!showInfo)}
          title="Theme info"
          className="w-8 h-8 bg-white dark:bg-[#18181b] text-black dark:text-white border-2 border-black dark:border-stone-700 font-mono-tech font-black flex items-center justify-center text-xs manga-shadow-sm hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
        >
          ?
        </button>

        <button
          onClick={toggleTheme}
          className="bg-[#bef264] hover:bg-[#a3e635] text-black border-2 border-black px-3.5 py-2 font-mono-tech font-black text-xs manga-shadow transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span className="text-sm">{isDark ? '☾' : '☼'}</span>
          <span>{isDark ? 'DARK NOIR' : 'LIGHT DRAFT'}</span>
          <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded">
            TOGGLE
          </span>
        </button>
      </div>
    </div>
  );
}
