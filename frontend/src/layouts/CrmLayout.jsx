import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
  Menu,
  X,
  Radio
} from 'lucide-react';

export default function CrmLayout() {
  const { user, logout, isAdmin, isSuperAdmin, isEmployee } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/crm/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/crm/dashboard', icon: LayoutDashboard },
    { name: 'Leads & Inquiries', path: '/crm/leads', icon: Users },
    { name: 'Analytics & KPIs', path: '/crm/analytics', icon: TrendingUp },
    ...(isAdmin ? [{ name: 'Team & Roster', path: '/crm/employees', icon: UserCheck }] : []),
    ...(isAdmin ? [{ name: 'Audit Trail', path: '/crm/audit-logs', icon: ShieldCheck }] : []),
    { name: 'System & Config', path: '/crm/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] text-stone-900 dark:text-stone-100 font-sans flex flex-col transition-colors duration-300">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#faf8f5] dark:bg-[#121216] border-b-[2.5px] border-black dark:border-stone-700 px-4 sm:px-6 py-3 shadow-[0_4px_0_rgba(0,0,0,0.06)]">
        <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 border-2 border-black dark:border-stone-700 rounded-lg bg-white dark:bg-[#1a1a20] shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/crm/dashboard" className="flex items-center gap-2 group">
              <span className="font-heading font-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase group-hover:text-[#bef264] transition-colors">
                OG MEDIA
              </span>
              <span className="bg-black text-[#bef264] border border-black font-mono-tech text-[10px] sm:text-xs font-black px-2 py-0.5 rounded shadow-[2px_2px_0px_#bef264]">
                DISPATCH HQ
              </span>
            </Link>

            {/* Live Buffer Status Indicator */}
            <div className="hidden md:flex items-center gap-2 ml-4 px-2.5 py-1 bg-white dark:bg-[#1a1a20] border border-black dark:border-stone-700 rounded-md font-mono-tech text-[10px] font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span className="text-stone-700 dark:text-stone-300">BUFFER INGESTION: ACTIVE</span>
            </div>
          </div>

          {/* Right: Actions, Theme Toggle, Public Link & User Profile */}
          <div className="flex items-center gap-3">
            {/* View Public Site Link */}
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 font-mono-tech text-[11px] font-bold px-3 py-1.5 bg-white dark:bg-[#1a1a20] hover:bg-[#bef264] hover:text-black border-2 border-black dark:border-stone-700 rounded-lg shadow-[2px_2px_0px_#000] transition-all"
            >
              <span>PUBLIC TRANSMISSION</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 border-2 border-black dark:border-stone-700 rounded-lg bg-white dark:bg-[#1a1a20] hover:bg-stone-100 dark:hover:bg-stone-800 shadow-[2px_2px_0px_#000] cursor-pointer transition-transform active:translate-y-0.5"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#bef264]" /> : <Moon className="w-4 h-4 text-black" />}
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl shadow-[3px_3px_0px_#000]">
              <div className="w-6 h-6 rounded bg-[#bef264] border border-black text-black font-mono-tech font-black text-xs flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left font-mono-tech leading-tight hidden sm:block">
                <div className="text-xs font-black text-black dark:text-white truncate max-w-[130px]">
                  {user?.name}
                </div>
                <div className="text-[10px] text-stone-500 font-bold uppercase">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="ml-1 p-1 hover:text-[#ef4444] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main App Body */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col justify-between w-64 border-r-2 border-black dark:border-stone-700 bg-[#faf8f5] dark:bg-[#121216] p-4 select-none shrink-0">
          <div className="space-y-6">
            
            {/* Mission Protocol Badge */}
            <div className="p-3 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl shadow-[3px_3px_0px_#000] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono-tech font-bold text-stone-500">
                <span>PROTOCOL</span>
                <span className="text-[#16a34a] font-black">ONLINE</span>
              </div>
              <div className="font-mono-tech text-xs font-black text-black dark:text-white">
                NODE // {user?.username}
              </div>
              <div className="text-[10px] font-mono-tech text-stone-600 dark:text-stone-400">
                ROLE: <span className="bg-[#bef264] text-black px-1.5 py-0.2 rounded font-black">{user?.role}</span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 font-mono-tech text-xs font-bold">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-black text-[#bef264] border-black dark:border-stone-600 shadow-[3px_3px_0px_#bef264] -translate-y-0.5'
                          : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-800 hover:border-black shadow-[2px_2px_0px_#000]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

          </div>

          {/* Sidebar Footer: Expertise Isolation Badges */}
          <div className="pt-4 border-t-2 border-black/20 dark:border-stone-800 space-y-2 font-mono-tech text-[10px]">
            <div className="font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
              <span>AUTHORIZED SECTORS</span>
              <Radio className="w-3 h-3 text-[#bef264] animate-pulse" />
            </div>

            {isEmployee ? (
              <div className="flex flex-wrap gap-1">
                {(user?.expertise || []).length > 0 ? (
                  user.expertise.map((srv) => (
                    <span
                      key={srv}
                      className="bg-black text-[#bef264] px-2 py-0.5 rounded border border-black font-extrabold text-[9px]"
                    >
                      {srv.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-500 italic">No sectors assigned</span>
                )}
              </div>
            ) : (
              <div className="bg-[#bef264]/20 border border-[#bef264] p-2 rounded text-black dark:text-stone-200 font-bold">
                ★ GLOBAL ACCESS CLEARANCE
              </div>
            )}

            <div className="text-stone-400 text-[9px] pt-1">
              OG MEDIA CORE INGESTION V2.4
            </div>
          </div>
        </aside>

        {/* Mobile Slide-Out Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
            <div className="w-72 bg-[#faf8f5] dark:bg-[#121216] border-r-2 border-black p-5 flex flex-col justify-between h-full shadow-[8px_0_0_#000]">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-stone-700">
                  <div className="font-heading font-black text-xl text-black dark:text-white">
                    OG MEDIA CRM
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 border border-black rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2 font-mono-tech text-xs font-bold">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 ${
                            isActive
                              ? 'bg-black text-[#bef264] border-black shadow-[3px_3px_0px_#bef264]'
                              : 'bg-white dark:bg-[#1a1a20] border-black/30'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-[#ef4444] text-white font-mono-tech font-bold py-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>SIGN OUT</span>
              </button>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}
