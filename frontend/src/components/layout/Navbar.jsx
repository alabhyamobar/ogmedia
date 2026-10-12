import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import OgLogo from '../ui/OgLogo';

export default function Navbar() {
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Scroll detection: slide out when scrolling DOWN, slide in when scrolling UP
  useEffect(() => {
    let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;

          // Always visible at the very top of the page
          if (currentScrollY <= 40) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
            // Scrolling DOWN -> hide navbar (slides up/out)
            if (!mobileMenuOpen) {
              setIsVisible(false);
            }
          } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
            // Scrolling UP -> reveal navbar (slides down into view)
            setIsVisible(true);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleAnchorClick = (e, targetHash) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setIsVisible(true);
    const targetId = targetHash.replace('#', '');
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(`/${targetHash}`);
    }
  };

  const navLinks = [
    {
      hash: '#story',
      num: '01',
      label: 'STORY',
      sub: 'GENESIS & TIMELINE',
      accentColor: '#38bdf8',
      hoverClass: 'hover:bg-[#38bdf8] hover:text-black dark:hover:bg-[#38bdf8] dark:hover:text-black'
    },
    {
      hash: '#arsenal',
      num: '02',
      label: 'ARSENAL',
      sub: 'SERVICES & PROTOCOLS',
      accentColor: '#a855f7',
      hoverClass: 'hover:bg-[#a855f7] hover:text-white dark:hover:bg-[#a855f7] dark:hover:text-white'
    },
    {
      hash: '#covers',
      num: '03',
      label: 'COVERS',
      sub: 'CASE STUDIES & GALLERY',
      accentColor: '#f59e0b',
      hoverClass: 'hover:bg-[#f59e0b] hover:text-black dark:hover:bg-[#f59e0b] dark:hover:text-black'
    },
    {
      hash: '#contact',
      num: '04',
      label: 'TRANSMISSION',
      sub: 'INQUIRY & DISPATCH',
      accentColor: '#ef4444',
      hoverClass: 'hover:bg-[#ef4444] hover:text-white dark:hover:bg-[#ef4444] dark:hover:text-white'
    }
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 w-full bg-[#FFFFFF]/95 dark:bg-[#1A1A1A]/95 backdrop-blur-md border-b-2 border-black dark:border-[#333333] z-[60] px-3 sm:px-6 py-2 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0 shadow-md' : '-translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-[1300px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              title="Return to Main Archive"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <OgLogo size="sm" withText={true} subtitle="CREATIVE INTELLIGENCE STUDIO" />
            </Link>

            <div className="hidden sm:flex bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-mono-tech text-[10px] sm:text-xs font-bold px-2 py-1 tracking-tight uppercase border-2 border-black dark:border-stone-800 items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              OG MEDIA // ORIGINAL / 001
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-1.5 font-mono-tech text-xs font-bold">
              {navLinks.map((link) => (
                <a
                  key={link.hash}
                  href={link.hash}
                  onClick={(e) => handleAnchorClick(e, link.hash)}
                  className={`bg-white dark:bg-[#18181c] dark:text-white dark:border-[#38383e] ${link.hoverClass} px-2 py-1 border border-black transition-all hover:scale-105`}
                >
                  [ {link.num} {link.label} ]
                </a>
              ))}
              <Link
                to="/crm/dashboard"
                className="bg-black text-[#39FF14] hover:bg-[#39FF14] hover:text-black dark:border-stone-700 px-2.5 py-1 border border-black transition-all hover:scale-105 font-black shadow-[2px_2px_0px_#39FF14]"
              >
                [ 05 CRM HQ ]
              </Link>
            </div>

            <button
              onClick={toggleTheme}
              title="Toggle between Dark Noir and Light modes"
              className="flex items-center gap-1.5 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-bold text-xs px-2.5 py-1 border-2 border-black manga-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.4)]"
            >
              <span className="text-sm">{isDark ? '☾' : '☼'}</span>
              <span className="bg-black text-[#39FF14] px-1.5 py-0.5 rounded text-[10px] uppercase font-mono-tech font-bold">
                {isDark ? 'NOIR' : 'LIGHT'}
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(!mobileMenuOpen);
                setIsVisible(true);
              }}
              className="lg:hidden flex items-center justify-center p-1.5 bg-white dark:bg-[#18181c] text-black dark:text-white border-2 border-black dark:border-[#38383e] manga-shadow-sm hover:bg-[#39FF14] hover:text-black dark:hover:bg-[#39FF14] dark:hover:text-black transition-all active:translate-y-0.5 cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent page content from being hidden behind the fixed navbar */}
      <div className="h-[52px] sm:h-[56px] w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* Mobile Drawer Backdrop and Panel portaled to document.body with z-[100] so it stays completely above the Hero section */}
      {typeof document !== 'undefined' && createPortal(
        <>
          <div
            className={`lg:hidden fixed inset-0 z-[90] bg-black/70 backdrop-blur-xs transition-opacity duration-300 ${
              mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className={`lg:hidden fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#FFFFFF] dark:bg-[#1A1A1A] border-l-[3px] border-black dark:border-[#333333] z-[100] flex flex-col justify-between p-5 shadow-[-8px_0px_0px_#000000] dark:shadow-[-8px_0px_0px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-[#27272a]">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-lg text-black dark:text-white uppercase tracking-tight">
                    NAVIGATION
                  </span>
                  <span className="bg-[#39FF14] text-black font-mono-tech text-[10px] font-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                    MENU
                  </span>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 bg-white dark:bg-[#18181c] text-black dark:text-white border-2 border-black dark:border-stone-700 manga-shadow-sm hover:bg-[#ef4444] hover:text-white dark:hover:bg-[#ef4444] transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-[#ef4444] to-[#f43f5e] text-white font-mono-tech text-[10px] font-bold px-2.5 py-1.5 tracking-tight uppercase border-2 border-black dark:border-stone-800 flex items-center justify-between shadow-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                  OG MEDIA // ORIGINAL
                </span>
                <span className="font-black bg-black/40 px-1 rounded">001</span>
              </div>

              <nav className="flex flex-col gap-2.5 pt-1 font-mono-tech text-xs font-bold">
                {navLinks.map((link) => (
                  <a
                    key={link.hash}
                    href={link.hash}
                    onClick={(e) => handleAnchorClick(e, link.hash)}
                    className={`flex items-center justify-between bg-white dark:bg-[#18181c] text-stone-900 dark:text-white border-2 border-black dark:border-[#38383e] px-3.5 py-2.5 manga-shadow-sm ${link.hoverClass} transition-all active:translate-y-0.5 hover:translate-x-1`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="font-black text-sm"
                        style={{ color: link.accentColor }}
                      >
                        {link.num}
                      </span>
                      <div className="flex flex-col text-left leading-tight">
                        <span className="font-black tracking-tight">{link.label}</span>
                        <span className="text-[9px] text-stone-500 dark:text-stone-400 font-normal">
                          {link.sub}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black">→</span>
                  </a>
                ))}

                <Link
                  to="/crm/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between bg-black text-[#39FF14] border-2 border-black dark:border-stone-700 px-3.5 py-3 manga-shadow-lime hover:bg-[#39FF14] hover:text-black transition-all active:translate-y-0.5 hover:translate-x-1 font-black mt-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="bg-[#39FF14] text-black text-[10px] px-1.5 py-0.5 rounded font-black">
                      05
                    </span>
                    <div className="flex flex-col text-left leading-tight">
                      <span className="tracking-tight">CRM HQ // DISPATCH</span>
                      <span className="text-[9px] text-[#39FF14]/80 group-hover:text-black/80 font-normal">
                        OPERATIONAL DASHBOARD
                      </span>
                    </div>
                  </div>
                  <span className="text-sm">⚡</span>
                </Link>
              </nav>
            </div>

            <div className="pt-4 border-t-2 border-black/20 dark:border-stone-800 space-y-3 font-mono-tech">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                  DISPLAY THEME
                </span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-bold text-xs px-2.5 py-1 border-2 border-black manga-shadow-sm transition-all cursor-pointer"
                >
                  <span>{isDark ? '☾' : '☼'}</span>
                  <span className="bg-black text-[#39FF14] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                    {isDark ? 'NOIR' : 'DRAFT'}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between text-stone-400 dark:text-stone-500 text-[9px] pt-1">
                <span>OG MEDIA AGENCY</span>
                <span>V2.4 ONLINE</span>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
