import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';

export default function AnalyticsPage() {
  const { isAdmin } = useAuth();
  const [selectedService, setSelectedService] = useState('ALL');

  // Fetch overview analytics
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview-full', selectedService],
    queryFn: () => api.getOverviewAnalytics({ service: selectedService === 'ALL' ? undefined : selectedService })
  });

  // Fetch service distribution
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['analytics-services'],
    queryFn: () => api.getServiceAnalytics()
  });

  // Fetch employee performance (admin only)
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['analytics-employees'],
    queryFn: () => api.getEmployeeAnalytics(),
    enabled: isAdmin
  });

  const overview = overviewData?.data || {};
  const counts = overview.counts || { TOTAL: 0, NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, LOST: 0 };
  const comparison = overview.comparison || {};
  const serviceList = servicesData?.data || [];
  const employeeList = employeesData?.data || [];

  return (
    <div className="space-y-6 sm:space-y-8 select-none font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs font-bold text-stone-500">
            /// 03 PERFORMANCE TELEMETRY
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            Analytics & Conversion KPIs
          </h1>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
            Real-time conversion metrics calculated from permanent MongoDB records with Redis acceleration.
          </p>
        </div>

        {/* Sector Filter */}
        <div className="font-mono-tech text-xs">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-bold shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
          >
            <option value="ALL">All Sectors Overview</option>
            <option value="META_ADS">Meta Ads & Paid Media</option>
            <option value="GOOGLE_ADS">Google Ads & PPC</option>
            <option value="SEO">SEO & Organic Growth</option>
            <option value="WEB_DEVELOPMENT">3D Web & App Design</option>
            <option value="SOCIAL_MEDIA">Creators & Influencers</option>
            <option value="CONTENT_MARKETING">Meme Culture & Viral</option>
            <option value="GRAPHIC_DESIGN">Luxury Brand Direction</option>
            <option value="GENERAL">Full Growth Strategy</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech">
        
        {/* Card 1: Total Leads */}
        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>Total Transmissions</span>
            <Users className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-3xl font-black text-black dark:text-white">
            {overviewLoading ? '...' : counts.TOTAL.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-500">
            Selected Sector Filter: <span className="font-bold">{selectedService}</span>
          </div>
        </div>

        {/* Card 2: Converted */}
        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>Converted Retainers</span>
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          </div>
          <div className="text-3xl font-black text-[#16a34a]">
            {overviewLoading ? '...' : counts.CONVERTED.toLocaleString()}
          </div>
          <div className="text-[10px] text-stone-500">
            Successfully closed deals
          </div>
        </div>

        {/* Card 3: Overall Conversion Rate */}
        <div className="bg-[#bef264] border-2 border-black rounded-xl p-5 shadow-[4px_4px_0px_#000] text-black space-y-2">
          <div className="flex items-center justify-between text-black/70 text-xs font-black uppercase">
            <span>Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-black" />
          </div>
          <div className="text-3xl font-black text-black">
            {overviewLoading ? '...' : `${overview.conversionRate || 0}%`}
          </div>
          <div className="text-[10px] font-bold">
            (Converted / Total) × 100
          </div>
        </div>

        {/* Card 4: Period Comparison */}
        <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-xl p-5 shadow-[4px_4px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase">
            <span>Month vs Previous</span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>

          {comparison.baselineNote ? (
            <div className="space-y-1">
              <div className="text-sm font-bold text-stone-700 dark:text-stone-300">
                {comparison.baselineNote}
              </div>
              <div className="text-[10px] text-stone-500">
                Previous period had 0 converted baseline.
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className={`text-2xl font-black flex items-center gap-1 ${
                comparison.percentageChange >= 0 ? 'text-[#16a34a]' : 'text-[#ef4444]'
              }`}>
                {comparison.percentageChange >= 0 ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
                <span>{comparison.percentageChange}%</span>
              </div>
              <div className="text-[10px] text-stone-500">
                Current: {comparison.currentMonthConverted} vs Prev: {comparison.previousMonthConverted}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Grid: Sector Distribution (7 cols) + Employee Performance (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sector Distribution Breakdown */}
        <div className="lg:col-span-7 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech">
          <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
            <span className="font-black text-xs uppercase flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#bef264]" />
              <span>Inquiry Volume by Sector / Service</span>
            </span>
          </div>

          <div className="space-y-4">
            {servicesLoading ? (
              <div className="py-12 text-center text-xs text-stone-500 animate-pulse">
                Calculating sector breakdowns...
              </div>
            ) : serviceList.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                No sector inquiries recorded yet.
              </div>
            ) : (
              serviceList.map((item) => {
                const percentage = counts.TOTAL > 0 ? Math.round((item.total / counts.TOTAL) * 100) : 0;
                return (
                  <div key={item.service} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-black dark:text-white">
                        {item.service.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-stone-500">{item.total} leads ({percentage}%)</span>
                        <span className="font-black text-[#16a34a]">{item.conversionRate}% Win</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden border border-black/20">
                      <div
                        className="bg-[#bef264] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Employee Performance Leaderboard (Admin Only) */}
        <div className="lg:col-span-5 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech">
          <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
            <span className="font-black text-xs uppercase flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#bef264]" />
              <span>Agent Performance Roster</span>
            </span>
          </div>

          {!isAdmin ? (
            <div className="py-8 text-center text-xs text-stone-500 italic">
              Employee leaderboard is restricted to administrative clearance.
            </div>
          ) : employeesLoading ? (
            <div className="py-12 text-center text-xs text-stone-500 animate-pulse">
              Aggregating agent scores...
            </div>
          ) : employeeList.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No employee assignments recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {employeeList.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3 bg-white dark:bg-[#1e1e24] border border-black/30 dark:border-stone-700 rounded-xl space-y-1 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-black dark:text-white">{emp.name}</div>
                      <div className="text-[10px] text-stone-500">
                        @{emp.username} • {emp.expertise?.join(', ') || 'Global'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#16a34a]">
                        {emp.conversionRate}%
                      </div>
                      <div className="text-[9px] text-stone-400">WIN RATE</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <span>Assigned: {emp.totalLeads}</span>
                    <span>In-Progress: {emp.inProgress}</span>
                    <span className="font-bold text-[#16a34a]">Won: {emp.converted}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
