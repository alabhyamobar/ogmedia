import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Filter, ChevronLeft, ChevronRight, RefreshCw, Lock } from 'lucide-react';

const ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'LOGIN_FAILED',
  'EMPLOYEE_CREATED',
  'EMPLOYEE_DISABLED',
  'EMPLOYEE_ENABLED',
  'PASSWORD_RESET',
  'LEAD_CREATED',
  'LEAD_ASSIGNED',
  'LEAD_UPDATED',
  'LEAD_STATUS_CHANGED',
  'EMPLOYEE_EXPERTISE_CHANGED'
];

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [selectedAction, setSelectedAction] = useState('ALL');
  const { isDeveloper } = useAuth();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['audit-logs', page, selectedAction],
    queryFn: () =>
      api.getAuditLogs({
        page,
        limit: 20,
        action: selectedAction === 'ALL' ? undefined : selectedAction
      }),
    enabled: isDeveloper,
    keepPreviousData: true
  });

  const logs = data?.data?.logs || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  if (!isDeveloper) {
    return (
      <div className="space-y-6 select-none font-sans py-8">
        <div className="p-8 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[6px_6px_0px_#000] text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ef4444]/15 border-2 border-[#ef4444] text-[#ef4444] flex items-center justify-center font-black shadow-[3px_3px_0px_#ef4444]">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="font-mono-tech text-xs font-bold text-[#ef4444]">
              /// POLICY RESTRICTION // CLEARANCE 403
            </div>
            <h2 className="font-heading font-black text-2xl text-black dark:text-white uppercase tracking-tight">
              Module Access Restricted
            </h2>
          </div>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            This partition is locked under enterprise security compliance policies. Administrative clearance does not include access to this module.
          </p>
          <div className="pt-3">
            <Link
              to="/crm/dashboard"
              className="inline-flex items-center gap-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-mono-tech font-bold text-xs px-5 py-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] transition-transform hover:scale-105 active:scale-95"
            >
              <span>RETURN TO CRM DASHBOARD</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs font-bold text-stone-500 flex items-center gap-2">
            <span>/// 05 IMMUTABLE SECURITY LEDGER</span>
            <span className="bg-[#bef264] text-black font-black text-[9px] px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              DEVELOPER EXCLUSIVE
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            Audit Logs & Security Trail
          </h1>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
            Append-only compliance log tracking logins, lead mutations, role alterations, and dispatch activities.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a20] hover:bg-[#bef264] hover:text-black border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>REFRESH LOGS</span>
        </button>
      </div>

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-4 shadow-[5px_5px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-500" />
          <span className="font-bold uppercase text-stone-600 dark:text-stone-400">Filter Event:</span>
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none font-bold"
          >
            <option value="ALL">All Recorded Actions</option>
            {ACTIONS.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="text-stone-500 text-[11px]">
          Total Log Events: <span className="font-bold text-black dark:text-white">{pagination.total}</span>
        </div>
      </div>

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
        
        {isLoading ? (
          <div className="py-20 text-center font-mono-tech text-xs text-stone-500 animate-pulse">
            [ QUERYING AUDIT LEDGER ENTRIES... ]
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center font-mono-tech text-xs text-stone-400">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-[#1a1a20] border-b-2 border-black dark:border-stone-700 text-stone-600 dark:text-stone-400 uppercase text-[10px]">
                  <th className="py-3 px-4 font-black">Timestamp</th>
                  <th className="py-3 px-4 font-black">Action Event</th>
                  <th className="py-3 px-4 font-black">Agent / Actor</th>
                  <th className="py-3 px-4 font-black">Target Type</th>
                  <th className="py-3 px-4 font-black">Metadata Details</th>
                  <th className="py-3 px-4 font-black">Origin IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-stone-800">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-stone-500 text-[10px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          log.action === 'LOGIN_FAILED'
                            ? 'bg-[#ef4444] text-white border-black'
                            : log.action.includes('CREATED')
                            ? 'bg-[#16a34a] text-white border-black'
                            : 'bg-black text-[#bef264] border-black'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-black dark:text-white">
                        {log.performedByName}
                      </div>
                      <div className="text-[10px] text-stone-400 uppercase font-bold">
                        {log.role || 'SYSTEM'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-stone-600 dark:text-stone-400">
                        {log.targetType}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-xs truncate text-[11px] text-stone-700 dark:text-stone-300">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>

                    <td className="py-3 px-4 text-stone-500 text-[10px]">
                      {log.ip || 'INTERNAL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t-2 border-black dark:border-stone-700 bg-white dark:bg-[#121216] flex items-center justify-between font-mono-tech text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-1 border border-black dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <span className="font-bold text-stone-600 dark:text-stone-400 text-xs">
            PAGE {pagination.page} OF {pagination.totalPages || 1}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="flex items-center gap-1 px-3 py-1 border border-black dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 disabled:opacity-30 cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
}
