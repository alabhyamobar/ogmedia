import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin, isDeveloper, isEmployee } = useAuth();

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: () => api.getOverviewAnalytics(),
    refetchInterval: 15000
  });

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['recent-leads'],
    queryFn: () => api.getLeads({ limit: 6, page: 1 }),
    refetchInterval: 15000
  });

  const { data: healthData } = useQuery({
    queryKey: ['system-health-dashboard'],
    queryFn: () => api.getSystemHealth(),
    enabled: isDeveloper,
    refetchInterval: 10000
  });

  const counts = analyticsData?.data?.counts || { TOTAL: 0, NEW: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 };
  const conversionRate = analyticsData?.data?.conversionRate || 0;
  const recentLeads = leadsData?.data?.leads || [];

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      
      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-7 shadow-[6px_6px_0px_#000] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 manga-halftone pointer-events-none opacity-15" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-stone-500 mb-1">
              <span>/// 01</span>
              <span>TERMINAL STATUS: ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-4xl text-black dark:text-white uppercase tracking-tight">
              Welcome Back, {user?.name}.
            </h1>
            <p className="font-mono-tech text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-xl">
              {isAdmin || isDeveloper
                ? 'High-throughput Redis ingestion buffer is absorbing customer query transmissions. Operational database writes governed via controlled worker pool.'
                : `You are authorized for sector(s): ${user?.expertise?.join(', ') || 'General'}. Viewing leads strictly scoped to your domain clearance.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/crm/leads"
              className="bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-black text-xs px-4 py-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>OPEN LEADS INVENTORY</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            {(isAdmin || isDeveloper) && (
              <Link
                to="/crm/analytics"
                className="bg-white dark:bg-[#1e1e24] hover:bg-stone-100 text-black dark:text-white font-mono-tech font-bold text-xs px-4 py-2.5 border-2 border-black dark:border-stone-700 rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>ANALYTICS REPORT</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 font-mono-tech">
        
        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>{isEmployee ? 'My Sector Inquiries' : 'Total Inquiries'}</span>
            <Users className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black dark:text-white">
            {analyticsLoading ? '...' : counts.TOTAL.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 font-bold flex items-center gap-1">
            <span className="text-[#16a34a]">● LIVE</span>
            <span>Buffered via Redis Stream</span>
          </div>
        </div>

        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>New & Uncontacted</span>
            <Clock className="w-4 h-4 text-[#ef4444]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#ef4444]">
            {analyticsLoading ? '...' : counts.NEW.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 font-bold">
            Needs initial dispatch follow-up
          </div>
        </div>

        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>Converted Deals</span>
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#16a34a]">
            {analyticsLoading ? '...' : counts.CONVERTED.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-500 font-bold">
            Won client retainers
          </div>
        </div>

        <div className="bg-[#39FF14] border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] text-black space-y-2">
          <div className="flex items-center justify-between text-black/70 text-xs font-black uppercase">
            <span>Conversion Win Rate</span>
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-black">
            {analyticsLoading ? '...' : `${conversionRate}%`}
          </div>
          <div className="text-[11px] text-black font-bold">
            Target benchmark: &gt; 15%
          </div>
        </div>

      </div>

      {isDeveloper && healthData?.data?.queue && (
        <div className="bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono-tech text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black text-[#39FF14] border border-black rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-black dark:text-white uppercase flex items-center gap-2">
                <span>REDIS STREAM QUEUE TELEMETRY</span>
                <span className="bg-[#39FF14] text-black text-[9px] px-1.5 py-0.5 rounded font-black">
                  {healthData.data.queue.status}
                </span>
              </div>
              <div className="text-stone-500 text-[11px]">
                Stream: <code className="font-bold">{healthData.data.queue.streamName}</code> | Group: <code className="font-bold">{healthData.data.queue.consumerGroup}</code>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] font-bold">
            <div>
              <span className="text-stone-500">Queue Length: </span>
              <span className="text-black dark:text-white font-black">{healthData.data.queue.queueLength}</span>
            </div>
            <div>
              <span className="text-stone-500">Unacknowledged (PEL): </span>
              <span className="text-black dark:text-white font-black">{healthData.data.queue.pendingCount}</span>
            </div>
            <div>
              <span className="text-stone-500">Dead Letter Queue: </span>
              <span className="text-[#ef4444] font-black">{healthData.data.queue.dlqLength}</span>
            </div>
            <Link
              to="/crm/settings"
              className="text-black dark:text-white underline font-bold hover:text-[#39FF14]"
            >
              Full Diagnostics →
            </Link>
          </div>
        </div>
      )}

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-7 shadow-[6px_6px_0px_#000] space-y-5">
        <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-4">
          <div>
            <div className="font-mono-tech text-xs font-bold text-stone-500">
              // RECENT TRANSMISSIONS
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-black dark:text-white uppercase">
              Incoming Lead Stream
            </h2>
          </div>

          <Link
            to="/crm/leads"
            className="font-mono-tech text-xs font-bold flex items-center gap-1 hover:text-[#39FF14] transition-colors"
          >
            <span>View All ({leadsData?.data?.pagination?.total || 0})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {leadsLoading ? (
          <div className="py-12 text-center font-mono-tech text-xs text-stone-500 animate-pulse">
            [ QUERYING MONGODB DURABLE STORAGE... ]
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="py-12 text-center font-mono-tech text-xs text-stone-500 space-y-2">
            <div>No inquiries found in this scope yet.</div>
            <div className="text-[11px] text-stone-400">
              Submit a test query from the website contact form to observe high-speed ingestion!
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black dark:border-stone-700 text-stone-500 uppercase text-[10px]">
                  <th className="pb-3 font-black">Customer / Company</th>
                  <th className="pb-3 font-black">Sector / Service</th>
                  <th className="pb-3 font-black">Status</th>
                  <th className="pb-3 font-black">Assigned To</th>
                  <th className="pb-3 font-black">Received</th>
                  <th className="pb-3 font-black text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-stone-800">
                {recentLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-3.5 pr-4">
                      <div className="font-black text-black dark:text-white">
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate max-w-[200px]">
                        {lead.company ? `${lead.company} • ` : ''}{lead.email}
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span className="bg-black text-[#39FF14] font-black text-[10px] px-2 py-0.5 rounded border border-black dark:border-stone-700">
                        {lead.service}
                      </span>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                          lead.status === 'CONVERTED'
                            ? 'bg-[#16a34a] text-white border-black'
                            : lead.status === 'NEW'
                            ? 'bg-[#ef4444] text-white border-black animate-pulse'
                            : lead.status === 'LOST'
                            ? 'bg-stone-300 text-stone-800 border-stone-400'
                            : 'bg-[#39FF14] text-black border-black'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 pr-4 text-stone-700 dark:text-stone-300">
                      {lead.assignedTo ? lead.assignedTo.name : <span className="text-stone-400 italic">Unassigned</span>}
                    </td>

                    <td className="py-3.5 pr-4 text-stone-500 text-[10px]">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <Link
                        to={`/crm/leads/${lead._id}`}
                        className="inline-block bg-white dark:bg-[#1a1a20] hover:bg-black hover:text-[#39FF14] px-2.5 py-1 border border-black dark:border-stone-700 rounded shadow-sm transition-all"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
