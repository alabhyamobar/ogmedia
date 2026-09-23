import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { login, signup, quickDemoLogin, user } = useAuth();

  // Determine mode from route path (/signup vs /login) or initialMode prop
  const [mode, setMode] = useState(() => {
    if (location.pathname.includes('signup')) return 'signup';
    return initialMode;
  });

  useEffect(() => {
    if (location.pathname.includes('signup')) {
      setMode('signup');
    } else if (location.pathname.includes('login')) {
      setMode('login');
    }
  }, [location.pathname]);

  // Form states
  const [email, setEmail] = useState('');
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [division, setDivision] = useState('CHRONICLE STORYBOARD // DIVISION 01');
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'EMPTY', color: 'bg-stone-300 dark:bg-stone-700' };
    if (pass.length < 6) return { score: 1, label: 'VULNERABLE', color: 'bg-red-500' };
    if (pass.length < 10) return { score: 2, label: 'STANDARD CIPHER', color: 'bg-amber-400' };
    return { score: 3, label: 'QUANTUM ENCRYPTED', color: 'bg-[#bef264]' };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('CRITICAL ERROR: OPERATIVE CREDENTIALS REQUIRED');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      login({ email, password, codename: codename || email.split('@')[0] });
      setSuccessMsg('ACCESS GRANTED // TRANSMITTING TO ARCHIVE SECTOR...');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }, 600);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!codename || !email || !password) {
      setErrorMsg('CRITICAL ERROR: ALL DOSSIER FIELDS MANDATORY');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('CIPHER MISMATCH: SECURITY PASSCODES DO NOT MATCH');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('ACCESS DENIED: OPERATIVE DIRECTIVE ACCORD REQUIRED');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      signup({ codename, email, password, division });
      setSuccessMsg('OPERATIVE ENLISTED // CLEARANCE CODE ASSIGNED');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    }, 600);
  };

  const handleDemoAccess = () => {
    setIsSubmitting(true);
    quickDemoLogin();
    setSuccessMsg('GHOST PROTOCOL ENGAGED // INSTANT CLEARANCE GRANTED');
    setTimeout(() => {
      navigate('/');
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] py-8 sm:py-12 px-3 sm:px-6 relative flex items-center justify-center">
      {/* Dynamic Background Screentone & Grid */}
      <div className="absolute inset-0 pointer-events-none draft-board-grid opacity-60"></div>
      <div className="absolute inset-0 pointer-events-none manga-halftone opacity-25"></div>

      {/* Cyber Manga Terminal Container */}
      <div className="relative z-10 w-full max-w-[1050px] bg-[#fbfbf8] dark:bg-[#121216] border-2 sm:border-3 border-black dark:border-[#2f2f38] manga-shadow-lg transition-all duration-300">
        
        {/* Terminal Header Telemetry Bar */}
        <div className="bg-black text-[#bef264] px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b-2 border-black font-mono-tech text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-[#bef264] rounded-full animate-ping"></span>
            <span className="font-bold text-white uppercase tracking-widest">
              OG MEDIA // OPERATIVE GATEWAY TERMINAL
            </span>
            <span className="bg-[#27272a] text-[#38bdf8] px-2 py-0.5 rounded text-[10px] hidden sm:inline">
              SYS_REV: 2.4.9
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#38bdf8] hidden md:inline">ENCRYPTION: AES-256-MANGA</span>
            <Link
              to="/"
              className="bg-[#27272a] hover:bg-[#ef4444] text-white px-2.5 py-0.5 rounded text-[11px] font-bold transition-colors flex items-center gap-1 border border-stone-700"
            >
              <span>←</span>
              <span>RETURN TO ARCHIVE</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Left Comic Graphic Panel & Right Auth Terminal */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Cyber-Manga Illustrated Dossier Panel */}
          <div className="lg:col-span-5 bg-[#e9e9e1] dark:bg-[#18181f] p-6 sm:p-8 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-[#2f2f38] flex flex-col justify-between relative overflow-hidden">
            {/* Manga Hatching texture */}
            <div className="absolute inset-0 manga-hatch opacity-40 pointer-events-none"></div>

            {/* Corner Decorative Tech Notations */}
            <div className="relative z-10 space-y-4">
              <div className="inline-block bg-black text-[#38bdf8] font-mono-tech text-[10px] font-bold px-2 py-1 tracking-widest border border-[#38bdf8]/50">
                CLASSIFIED DOSSIER // CHAPTER AUTH
              </div>

              <div>
                <h2 className="font-comic-title text-4xl sm:text-5xl text-black dark:text-white tracking-wide uppercase leading-none">
                  {mode === 'login' ? 'ACCESS TERMINAL' : 'ENLIST TODAY'}
                </h2>
                <p className="font-mono-tech text-xs text-stone-700 dark:text-stone-300 mt-2 leading-relaxed">
                  Join the Korean Webtoon & Manga digital archive network. Access raw storyboard manuscripts, production arsenals, and cinematic IP transmission sectors.
                </p>
              </div>

              {/* Comic Speech Bubble */}
              <div className="relative bg-white dark:bg-[#23232b] text-black dark:text-white p-4 border-2 border-black dark:border-stone-600 manga-shadow-sm font-sans text-xs sm:text-sm font-semibold">
                <div className="absolute -top-2 left-6 w-3 h-3 bg-white dark:bg-[#23232b] border-t-2 border-l-2 border-black dark:border-stone-600 transform rotate-45"></div>
                <p className="italic">
                  "Only authenticated operatives receive direct neural feed to unreleased chapter 02 concept reels!"
                </p>
                <div className="mt-2 text-right font-mono-tech text-[10px] text-stone-500">
                  — COMMANDER KAI // SECTOR 01
                </div>
              </div>

              {/* Sound Effect Sticker */}
              <div className="flex items-center gap-2 pt-2">
                <span className="font-jp-impact text-2xl sm:text-3xl text-red-600 dark:text-red-500 drop-shadow-[2px_2px_0px_#000000] rotate-[-4deg] inline-block animate-pulse">
                  ドドドド
                </span>
                <span className="font-comic-title text-lg tracking-wider text-black dark:text-[#bef264]">
                  DO-DOOOM!
                </span>
              </div>
            </div>

            {/* Bottom Clearance Card in Graphic Panel */}
            <div className="relative z-10 mt-6 pt-4 border-t-2 border-black/20 dark:border-stone-700/60 font-mono-tech text-xs space-y-2">
              <div className="flex justify-between items-center text-[11px] text-stone-600 dark:text-stone-400">
                <span>SECURITY CLEARANCE:</span>
                <span className="font-bold text-black dark:text-[#bef264]">LEVEL 04 // ACTIVE</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-600 dark:text-stone-400">
                <span>ARCHIVE STATUS:</span>
                <span className="font-bold text-[#38bdf8]">ONLINE // 100 FPS</span>
              </div>

              {/* Quick Demo Access Trigger */}
              <button
                type="button"
                onClick={handleDemoAccess}
                disabled={isSubmitting}
                className="w-full mt-3 bg-gradient-to-r from-[#bef264] to-[#86efac] hover:from-[#a3e635] hover:to-[#4ade80] text-black font-mono-tech font-bold text-xs py-2 px-3 border-2 border-black manga-shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚡</span>
                <span>INSTANT DEMO OPERATIVE LOGIN</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Form Terminal */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Selector: Login vs Signup */}
              <div className="flex items-center gap-2 border-b-2 border-black dark:border-stone-700 pb-3 mb-6 font-mono-tech text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    navigate('/login', { replace: true });
                  }}
                  className={`flex-1 py-2 px-3 border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'login'
                      ? 'bg-black text-[#bef264] manga-shadow-sm'
                      : 'bg-white dark:bg-[#1a1a22] text-stone-800 dark:text-stone-300 hover:bg-[#bef264]/20'
                  }`}
                >
                  <span>[ 01 ]</span>
                  <span>CIPHER LOGIN</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                    navigate('/signup', { replace: true });
                  }}
                  className={`flex-1 py-2 px-3 border-2 border-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#38bdf8] text-black manga-shadow-sm'
                      : 'bg-white dark:bg-[#1a1a22] text-stone-800 dark:text-stone-300 hover:bg-[#38bdf8]/20'
                  }`}
                >
                  <span>[ 02 ]</span>
                  <span>NEW OPERATIVE</span>
                </button>
              </div>

              {/* Status & Feedback Banners */}
              {errorMsg && (
                <div className="mb-5 bg-red-100 dark:bg-red-950/80 border-2 border-red-500 text-red-700 dark:text-red-300 p-3 font-mono-tech text-xs font-bold flex items-center gap-2 manga-shadow-sm animate-bounce">
                  <span className="text-base">⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-5 bg-[#bef264]/30 border-2 border-[#bef264] text-black dark:text-white p-3 font-mono-tech text-xs font-bold flex items-center gap-2 manga-shadow-sm">
                  <span className="text-base">✓</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form Body */}
              {mode === 'login' ? (
                /* LOGIN FORM */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block font-mono-tech text-xs font-bold mb-1.5 uppercase text-stone-800 dark:text-stone-200">
                      Operative Email or Callsign:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="agent.zero@ogmedia.studio"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3.5 py-2.5 border-2 border-black dark:border-stone-700 font-mono-tech text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#bef264] manga-shadow-sm"
                        required
                      />
                      <span className="absolute right-3 top-2.5 text-stone-400 font-mono-tech text-xs pointer-events-none">
                        [ID]
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-tech text-xs font-bold mb-1.5 uppercase text-stone-800 dark:text-stone-200">
                      Security Passcode:
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3.5 py-2.5 border-2 border-black dark:border-stone-700 font-mono-tech text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#bef264] manga-shadow-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 bg-stone-200 dark:bg-stone-800 hover:bg-[#bef264] hover:text-black text-stone-700 dark:text-stone-300 font-mono-tech text-[10px] px-2 py-1 border border-black transition-colors"
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono-tech pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 accent-[#bef264] border-2 border-black"
                      />
                      <span className="text-stone-700 dark:text-stone-300">
                        PERSIST TERMINAL SESSION
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => alert('Cipher Reset Signal dispatched to registered operative terminal.')}
                      className="text-[#38bdf8] hover:underline font-bold"
                    >
                      FORGOT CIPHER?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-black dark:bg-[#bef264] text-[#bef264] dark:text-black hover:bg-[#bef264] hover:text-black dark:hover:bg-white font-mono-tech font-bold text-sm py-3 px-4 border-2 border-black manga-shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 tracking-wider"
                  >
                    <span>{isSubmitting ? 'TRANSMITTING...' : 'AUTHENTICATE CIPHER // ACCESS ARCHIVE'}</span>
                    <span>→</span>
                  </button>
                </form>
              ) : (
                /* SIGNUP FORM */
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono-tech text-xs font-bold mb-1 uppercase text-stone-800 dark:text-stone-200">
                        Operative Callsign:
                      </label>
                      <input
                        type="text"
                        value={codename}
                        onChange={(e) => setCodename(e.target.value)}
                        placeholder="e.g. SHADOW-09"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3 py-2 border-2 border-black dark:border-stone-700 font-mono-tech text-xs focus:outline-none focus:ring-2 focus:ring-[#38bdf8] manga-shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-xs font-bold mb-1 uppercase text-stone-800 dark:text-stone-200">
                        Archive Email:
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operative@ogmedia.studio"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3 py-2 border-2 border-black dark:border-stone-700 font-mono-tech text-xs focus:outline-none focus:ring-2 focus:ring-[#38bdf8] manga-shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-tech text-xs font-bold mb-1 uppercase text-stone-800 dark:text-stone-200">
                      Clearance Division Assignment:
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3 py-2 border-2 border-black dark:border-stone-700 font-mono-tech text-xs focus:outline-none focus:ring-2 focus:ring-[#38bdf8] manga-shadow-sm"
                    >
                      <option value="CHRONICLE STORYBOARD // DIVISION 01">CHRONICLE STORYBOARD // DIVISION 01</option>
                      <option value="KOREAN MANHWA ARCHIVE // SECTION 02">KOREAN MANHWA ARCHIVE // SECTION 02</option>
                      <option value="CINEMATIC IP WEAPONRY // DIVISION 03">CINEMATIC IP WEAPONRY // DIVISION 03</option>
                      <option value="TRANSMISSION & AUDIO // DIVISION 04">TRANSMISSION & AUDIO // DIVISION 04</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono-tech text-xs font-bold mb-1 uppercase text-stone-800 dark:text-stone-200">
                        Security Passcode:
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3 py-2 border-2 border-black dark:border-stone-700 font-mono-tech text-xs focus:outline-none focus:ring-2 focus:ring-[#38bdf8] manga-shadow-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-mono-tech text-xs font-bold mb-1 uppercase text-stone-800 dark:text-stone-200">
                        Verify Passcode:
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white dark:bg-[#18181f] text-black dark:text-white px-3 py-2 border-2 border-black dark:border-stone-700 font-mono-tech text-xs focus:outline-none focus:ring-2 focus:ring-[#38bdf8] manga-shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="pt-1 font-mono-tech text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-stone-600 dark:text-stone-400">
                        <span>CIPHER STRENGTH:</span>
                        <span className="font-bold text-black dark:text-white">{strength.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 h-1.5">
                        <div className={`h-full border border-black ${strength.score >= 1 ? strength.color : 'bg-stone-200 dark:bg-stone-800'}`}></div>
                        <div className={`h-full border border-black ${strength.score >= 2 ? strength.color : 'bg-stone-200 dark:bg-stone-800'}`}></div>
                        <div className={`h-full border border-black ${strength.score >= 3 ? strength.color : 'bg-stone-200 dark:bg-stone-800'}`}></div>
                      </div>
                    </div>
                  )}

                  <label className="flex items-start gap-2 cursor-pointer select-none text-xs font-mono-tech pt-2">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#38bdf8] border-2 border-black"
                    />
                    <span className="text-stone-700 dark:text-stone-300">
                      I pledge allegiance to the OG Media Creative Protocols and agree not to leak unreleased storyboard frames.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 bg-[#38bdf8] text-black hover:bg-[#0284c7] hover:text-white font-mono-tech font-bold text-sm py-3 px-4 border-2 border-black manga-shadow transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 tracking-wider"
                  >
                    <span>{isSubmitting ? 'ENLISTING...' : 'CONFIRM DOSSIER // REGISTER OPERATIVE'}</span>
                    <span>⚔️</span>
                  </button>
                </form>
              )}
            </div>

            {/* Footer Notice */}
            <div className="mt-6 pt-4 border-t-2 border-black/20 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] text-stone-500">
              <span>AUTHORIZED ARCHIVE TERMINAL // V2.0</span>
              <span>© 2026 OG MEDIA STUDIOS</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
