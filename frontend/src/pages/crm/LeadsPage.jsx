import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserCheck
} from 'lucide-react';

const SERVICES_LIST = [
  'META_ADS',
  'GOOGLE_ADS',
  'SEO',
  'WEB_DEVELOPMENT',
  'SOCIAL_MEDIA',
  'CONTENT_MARKETING',
  'GRAPHIC_DESIGN',
  'GENERAL'
];

const STATUS_LIST = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CONVERTED',
  'LOST',
  'CLOSED'
];

export default function LeadsPage() {
  const { user, isAdmin, isDeveloper, isEmployee } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const service = searchParams.get('service') || 'ALL';
  const status = searchParams.get('status') || 'ALL';
  const assignedTo = searchParams.get('assignedTo') || 'ALL';

  const [searchInput, setSearchInput] = useState(search);

  const { data: employeesData } = useQuery({
    queryKey: ['employees-filter-list'],
    queryFn: () => api.getEmployees({ limit: 100 }),
    enabled: isAdmin || isDeveloper
  });

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['leads-list', page, search, service, status, assignedTo],
    queryFn: () =>
      api.getLeads({
        page,
        limit: 15,
        search,
        service: service === 'ALL' ? undefined : service,
        status: status === 'ALL' ? undefined : status,
        assignedTo: assignedTo === 'ALL' ? undefined : assignedTo
      }),
    keepPreviousData: true
  });

  const leads = data?.data?.leads || [];
  const pagination = data?.data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };

  const handleFilterChange = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'ALL') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleFilterChange('search', searchInput.trim());
  };

  return (
    <div className="space-y-6 select-none font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs font-bold text-stone-500">
            /// 02 INVENTORY REPOSITORY
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            Transmissions & Leads
          </h1>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
            {isEmployee
              ? `Filtered to your assigned sector(s): ${user?.expertise?.join(', ')}`
              : `Total of ${pagination.total.toLocaleString()} leads permanently stored in MongoDB.`}
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a20] hover:bg-[#39FF14] hover:text-black border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer transition-all active:translate-y-0.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>REFRESH STREAM</span>
        </button>
      </div>

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech text-xs">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search customer, email..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#39FF14]"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          </form>

          <div>
            <select
              value={service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Sectors</option>
              {SERVICES_LIST.map((srv) => (
                <option key={srv} value={srv}>
                  {srv.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {(isAdmin || isDeveloper) && (
            <div>
              <select
                value={assignedTo}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white outline-none cursor-pointer"
              >
                <option value="ALL">All Assignees</option>
                <option value="UNASSIGNED">Unassigned</option>
                {(employeesData?.data?.employees || []).map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.username})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

      </div>

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
        
        {isLoading ? (
          <div className="py-20 text-center font-mono-tech text-xs text-stone-500 animate-pulse">
            [ LOADING LEAD TRANSMISSIONS... ]
          </div>
        ) : leads.length === 0 ? (
          <div className="py-20 text-center font-mono-tech text-xs text-stone-500 space-y-2">
            <div className="font-bold text-sm">NO INQUIRIES MATCHING SPECIFICATIONS</div>
            <div className="text-stone-400">
              Try adjusting your sector, status, or search filters.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-[#1a1a20] border-b-2 border-black dark:border-stone-700 text-stone-600 dark:text-stone-400 uppercase text-[10px]">
                  <th className="py-3 px-4 font-black">Customer Details</th>
                  <th className="py-3 px-4 font-black">Sector</th>
                  <th className="py-3 px-4 font-black">Status</th>
                  <th className="py-3 px-4 font-black">Assigned To</th>
                  <th className="py-3 px-4 font-black">Created</th>
                  <th className="py-3 px-4 font-black">Last Contact</th>
                  <th className="py-3 px-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-stone-800">
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-black text-black dark:text-white">
                        {lead.name}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {lead.company && <span className="font-bold">{lead.company} • </span>}
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="text-[9px] text-stone-400">{lead.phone}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-black text-[#39FF14] font-black text-[10px] px-2 py-0.5 rounded border border-black dark:border-stone-700 whitespace-nowrap">
                        {lead.service}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded border whitespace-nowrap ${
                          lead.status === 'CONVERTED'
                            ? 'bg-[#16a34a] text-white border-black shadow-[1px_1px_0px_#000]'
                            : lead.status === 'NEW'
                            ? 'bg-[#ef4444] text-white border-black shadow-[1px_1px_0px_#000]'
                            : lead.status === 'LOST'
                            ? 'bg-stone-300 text-stone-800 border-stone-400'
                            : 'bg-[#39FF14] text-black border-black shadow-[1px_1px_0px_#000]'
                        }`}
                      >
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-stone-700 dark:text-stone-300">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-1 font-bold">
                          <UserCheck className="w-3 h-3 text-[#16a34a]" />
                          <span>{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-stone-500 text-[10px] whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-4 text-stone-500 text-[10px] whitespace-nowrap">
                      {lead.lastContactedAt
                        ? new Date(lead.lastContactedAt).toLocaleDateString()
                        : '—'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/crm/leads/${lead._id}`}
                        className="inline-block bg-white dark:bg-[#1a1a20] hover:bg-black hover:text-[#39FF14] text-black dark:text-white px-3 py-1 border-2 border-black dark:border-stone-700 rounded-lg shadow-[2px_2px_0px_#000] font-black text-xs transition-all hover:-translate-y-0.5"
                      >
                        VIEW →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t-2 border-black dark:border-stone-700 bg-white dark:bg-[#121216] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono-tech text-xs">
          <div className="text-stone-500 text-[11px]">
            Showing <span className="font-bold text-black dark:text-white">{leads.length}</span> of{' '}
            <span className="font-bold text-black dark:text-white">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange('page', String(page - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-black dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 disabled:opacity-30 cursor-pointer shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-black text-[#39FF14] border border-black rounded font-black text-xs">
              PAGE {pagination.page} / {pagination.totalPages || 1}
            </span>

            <button
              onClick={() => handleFilterChange('page', String(page + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1.5 border border-black dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 disabled:opacity-30 cursor-pointer shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
