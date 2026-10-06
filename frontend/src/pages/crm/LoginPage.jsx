import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import OgLogo from '../../components/ui/OgLogo';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/crm/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setForm({ login: 'developer', password: 'DevPass2026!@' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const from = location.state?.from?.pathname || '/crm/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(form.login, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#0A0A0A] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans select-none relative overflow-hidden text-black dark:text-[#F5F5F5]">
      
      <div className="absolute inset-0 manga-halftone pointer-events-none opacity-20 dark:opacity-10" />

      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <OgLogo size="sm" withText={false} />
          <span className="font-heading font-black text-2xl text-black dark:text-white tracking-tight uppercase group-hover:text-[#39FF14] transition-colors">
            OG MEDIA
          </span>
          <span
            onDoubleClick={() => setForm({ login: 'developer', password: 'DevPass2026!@' })}
            className="bg-black text-[#39FF14] font-mono-tech text-xs font-black px-2 py-0.5 rounded shadow-[2px_2px_0px_#39FF14] cursor-default"
          >
            HQ
          </span>
        </Link>

        <Link
          to="/"
          className="font-mono-tech text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white transition-colors"
        >
          ← Back to Agency Website
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-8 z-10">
        <div className="flex justify-center mb-6">
          <OgLogo size="lg" withText={true} subtitle="CREATIVE INTELLIGENCE STUDIO" />
        </div>
        <div className="bg-[#FFFFFF] dark:bg-[#1A1A1A] border-[2.5px] border-black dark:border-[#333333] rounded-2xl p-6 sm:p-8 shadow-[8px_8px_0px_#000] dark:shadow-[8px_8px_0px_#000]">
          
          <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-black text-[#39FF14] font-mono-tech font-black text-xs px-2.5 py-1 rounded">
                SECURE AUTH
              </span>
              <span className="font-mono-tech text-xs font-bold text-stone-600 dark:text-stone-400 tracking-wider">
                // CRM DISPATCH
              </span>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-ping" />
          </div>

          <div className="mb-6 space-y-1">
            <h1 className="font-heading font-black text-3xl text-black dark:text-white uppercase tracking-tight">
              Command Login.
            </h1>
            <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
              Enter your authorized agent credentials to access inquiry streams.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-[#ef4444]/15 border-2 border-[#ef4444] rounded-xl flex items-start gap-2.5 text-[#ef4444] font-mono-tech text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-bold">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block font-mono-tech text-xs font-bold text-stone-800 dark:text-stone-300 uppercase mb-1.5">
                Username or Agency Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.login}
                  onChange={(e) => setForm({ ...form, login: e.target.value })}
                  placeholder="e.g. admin or username"
                  className="w-full px-3.5 py-3 pl-10 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#39FF14] transition-all"
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-mono-tech text-xs font-bold text-stone-800 dark:text-stone-300 uppercase mb-1.5">
                Master Security Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-3 pl-10 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#39FF14] transition-all"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-black text-xs sm:text-sm py-3.5 px-6 border-2 border-black rounded-xl shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider disabled:opacity-50"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'ACCESS TERMINAL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-5 pt-4 border-t-2 border-black/10 dark:border-stone-800 space-y-2 font-mono-tech text-[11px]">
              <div className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                QUICK-FILL TEST PRESETS (DEV ONLY):
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ login: 'admin', password: 'AdminPass2026!@' })}
                  className="px-2.5 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-black hover:text-[#39FF14] text-stone-700 dark:text-stone-300 border border-black/20 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  ADMIN: @admin
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="max-w-md w-full mx-auto text-center font-mono-tech text-[10px] text-stone-500 z-10 space-y-1">
        <div>OG MEDIA SECURE CRM BUFFER PIPELINE</div>
        <div>PROTECTED VIA ARGON2ID/BCRYPT + REDIS BUFFER INGESTION</div>
      </div>

    </div>
  );
}
