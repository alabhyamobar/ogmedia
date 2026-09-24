import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import OgLogo from '../ui/OgLogo';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAnchorClick = (e, targetHash) => {
    e.preventDefault();
    if (location.pathname === '/' || location.pathname === '') {
      const targetId = targetHash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/${targetHash}`);
    }
  };

  return (
    <nav className="w-full bg-[#e5e5dc] dark:bg-[#121215] border-b-2 border-black dark:border-[#27272a] sticky top-0 z-40 px-3 sm:px-6 py-2 transition-colors duration-300">
      <div className="max-w-[1300px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Edition Badges & Brand link */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/"
            title="Return to Main Archive"
            className="flex items-center gap-2 hover:scale-[1.02] transition-transform"
          >
            <OgLogo size="sm" withText={true} subtitle="DIGITAL MEDIA AGENCY" />
          </Link>

          <div className="hidden sm:flex bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-1 tracking-tight uppercase border-2 border-black dark:border-stone-800 items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            LIMITED FIRST EDITION // 01 / 100
          </div>
        </div>

        {/* Right Side: Theme Toggle Button & Nav chapter anchors */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Nav chapter anchors with vibrant color-coded states */}
          <div className="hidden lg:flex items-center gap-1.5 font-mono-tech text-xs font-bold">
            <a
              href="#story"
              onClick={(e) => handleAnchorClick(e, '#story')}
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#38bdf8] hover:text-black dark:hover:bg-[#38bdf8] dark:hover:text-black px-2 py-1 border border-black transition-all hover:scale-105"
            >
              [ 01 STORY ]
            </a>
            <a
              href="#arsenal"
              onClick={(e) => handleAnchorClick(e, '#arsenal')}
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#a855f7] hover:text-white dark:hover:bg-[#a855f7] dark:hover:text-white px-2 py-1 border border-black transition-all hover:scale-105"
            >
              [ 02 ARSENAL ]
            </a>
            <a
              href="#covers"
              onClick={(e) => handleAnchorClick(e, '#covers')}
              className="bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] hover:bg-[#f59e0b] hover:text-black dark:hover:bg-[#f59e0b] dark:hover:text-black px-2 py-1 border border-black transition-all hover:scale-105"
            >
              [ 03 COVERS ]
            </a>
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, '#contact')}
              className="bg-black text-white hover:bg-[#ef4444] px-2 py-1 border border-black dark:border-stone-700 transition-all hover:scale-105"
            >
              [ 04 TRANSMISSION ]
            </a>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title="Toggle between Dark Noir and Light Draft modes"
            className="flex items-center gap-1.5 bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-bold text-xs px-2.5 py-1 border-2 border-black manga-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[0_0_10px_rgba(190,242,100,0.3)]"
          >
            <span className="text-sm">{isDark ? '☾' : '☼'}</span>
            <span className="bg-black text-[#bef264] px-1.5 py-0.5 rounded text-[10px] uppercase font-mono-tech font-bold">
              {isDark ? 'NOIR' : 'DRAFT'}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
