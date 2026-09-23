import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAuthPage = location.pathname.includes('login') || location.pathname.includes('signup');

  const handleAnchorClick = (e, targetHash) => {
    e.preventDefault();
    if (location.pathname === '/') {
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
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/"
            title="Return to Main Archive"
            className="bg-black text-[#38bdf8] font-mono-tech font-bold text-xs sm:text-sm px-2.5 py-1 tracking-wider border-2 border-[#38bdf8]/60 shadow-[0_0_12px_rgba(56,189,248,0.25)] hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <span>OG MEDIA</span>
            <span className="text-[#bef264]">//</span>
            <span className="text-white">ARCHIVE 01</span>
          </Link>

          <div className="hidden sm:flex bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-1 tracking-tight uppercase border-2 border-black dark:border-stone-800 items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            LIMITED FIRST EDITION // 01 / 100
          </div>
        </div>

        {/* Right Side: Auth Status, Theme Toggle Button & Nav links */}
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

          {/* Operative Authentication Button / Badge */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 bg-black text-white border-2 border-black px-2 py-1 manga-shadow-sm font-mono-tech text-xs">
              <span className="text-[#bef264] animate-pulse">{user.avatar || '⚡'}</span>
              <span className="font-bold text-[#bef264] hidden sm:inline">{user.codename}</span>
              <button
                onClick={logout}
                title="Disconnect terminal session"
                className="bg-[#ef4444] hover:bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 ml-1 border border-black cursor-pointer transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`font-mono-tech font-bold text-xs px-2.5 sm:px-3 py-1 border-2 border-black manga-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5 ${
                isAuthPage
                  ? 'bg-black text-[#bef264]'
                  : 'bg-white dark:bg-[#1a1a22] text-black dark:text-white hover:bg-[#bef264] hover:text-black dark:hover:bg-[#bef264] dark:hover:text-black'
              }`}
            >
              <span className="text-[#ef4444] animate-pulse">●</span>
              <span>[ ⚡ OPERATIVE LOGIN ]</span>
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
}
