import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireDeveloper = false
}) {
  const { user, isAuthenticated, isLoading, isAdmin, isSuperAdmin, isDeveloper } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] flex flex-col items-center justify-center font-mono-tech select-none">
        <div className="border-2 border-black dark:border-stone-700 bg-white dark:bg-[#16161a] p-6 rounded-2xl shadow-[6px_6px_0px_#000] text-center space-y-4 max-w-sm">
          <div className="inline-block bg-[#bef264] text-black font-extrabold text-xs px-3 py-1 border border-black rounded shadow-[2px_2px_0px_#000]">
            SECURITY PROTOCOL ACTIVE
          </div>
          <div className="text-sm font-bold text-stone-900 dark:text-stone-100 animate-pulse">
            [ VERIFYING BIOMETRICS & CREDENTIALS... ]
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden border border-black/20">
            <div className="bg-[#bef264] h-full w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (requireDeveloper && !isDeveloper) {
    return (
      <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] flex flex-col items-center justify-center font-mono-tech p-4">
        <div className="border-2 border-black dark:border-stone-700 bg-white dark:bg-[#16161a] p-8 rounded-2xl shadow-[6px_6px_0px_#ef4444] text-center space-y-4 max-w-md">
          <div className="bg-[#ef4444] text-white font-extrabold text-xs px-3 py-1 border border-black inline-block">
            RESTRICTED // PROTOCOL 403
          </div>
          <h2 className="font-heading text-2xl font-black text-black dark:text-white uppercase">
            Access Restricted
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            This module is restricted under enterprise security compliance policies. You do not have clearance to access this partition.
          </p>
          <Link
            to="/crm/dashboard"
            className="inline-block bg-black text-[#bef264] px-4 py-2 text-xs font-bold border border-black rounded shadow-[2px_2px_0px_#bef264] hover:-translate-y-0.5 transition-transform"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] flex flex-col items-center justify-center font-mono-tech p-4">
        <div className="border-2 border-black dark:border-stone-700 bg-white dark:bg-[#16161a] p-8 rounded-2xl shadow-[6px_6px_0px_#ef4444] text-center space-y-4 max-w-md">
          <div className="bg-[#ef4444] text-white font-extrabold text-xs px-3 py-1 border border-black inline-block">
            RESTRICTED CLEARANCE LEVEL 0
          </div>
          <h2 className="font-heading text-2xl font-black text-black dark:text-white uppercase">
            Access Denied
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            This module requires Super Administrator clearance. Your current role is: <span className="font-bold text-black dark:text-white">{user?.role}</span>.
          </p>
          <Link
            to="/crm/dashboard"
            className="inline-block bg-black text-[#bef264] px-4 py-2 text-xs font-bold border border-black rounded shadow-[2px_2px_0px_#bef264] hover:-translate-y-0.5 transition-transform"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (requireAdmin && !isAdmin && !isDeveloper) {
    return (
      <div className="min-h-screen bg-[#ebebe5] dark:bg-[#09090b] flex flex-col items-center justify-center font-mono-tech p-4">
        <div className="border-2 border-black dark:border-stone-700 bg-white dark:bg-[#16161a] p-8 rounded-2xl shadow-[6px_6px_0px_#ef4444] text-center space-y-4 max-w-md">
          <div className="bg-[#ef4444] text-white font-extrabold text-xs px-3 py-1 border border-black inline-block">
            ADMINISTRATIVE AREA
          </div>
          <h2 className="font-heading text-2xl font-black text-black dark:text-white uppercase">
            Access Restricted
          </h2>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Employees are restricted to lead follow-up within their assigned expertise.
          </p>
          <Link
            to="/crm/dashboard"
            className="inline-block bg-black text-[#bef264] px-4 py-2 text-xs font-bold border border-black rounded shadow-[2px_2px_0px_#bef264] hover:-translate-y-0.5 transition-transform"
          >
            ← Return to My Workspace
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
