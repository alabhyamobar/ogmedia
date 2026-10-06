import React, { useState, useMemo } from 'react';
import { BarChart3, ArrowUpDown, Filter, CheckCircle2, ChevronRight } from 'lucide-react';

const SERVICE_LABELS = {
  META_ADS: 'Meta Ads & Media',
  GOOGLE_ADS: 'Google Ads & PPC',
  SEO: 'SEO Growth Engine',
  WEB_DEVELOPMENT: '3D Web & Product',
  SOCIAL_MEDIA: 'Creators & Influencers',
  CONTENT_MARKETING: 'Viral Meme Strategy',
  GRAPHIC_DESIGN: 'Brand Identity / Art',
  GENERAL: 'Full Strategy Deck'
};

export default function ServiceBarChart({
  servicesData = [],
  selectedService = 'ALL',
  onSelectService,
  isLoading = false
}) {
  const [sortBy, setSortBy] = useState('total'); // 'total' | 'conversionRate' | 'converted'
  const [hoveredService, setHoveredService] = useState(null);

  // Clean and sort the service list
  const sortedList = useMemo(() => {
    if (!servicesData || servicesData.length === 0) return [];

    const copy = [...servicesData];
    copy.sort((a, b) => {
      if (sortBy === 'conversionRate') {
        return (b.conversionRate || 0) - (a.conversionRate || 0);
      }
      if (sortBy === 'converted') {
        return (b.converted || 0) - (a.converted || 0);
      }
      return (b.total || 0) - (a.total || 0);
    });
    return copy;
  }, [servicesData, sortBy]);

  // Max value for scaling bars
  const maxTotal = useMemo(() => {
    const highest = Math.max(...sortedList.map((s) => s.total || 0), 1);
    return Math.max(highest, 5);
  }, [sortedList]);

  return (
    <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] font-mono-tech select-none flex flex-col justify-between">
      
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black dark:border-stone-700 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-black dark:text-white">
            <BarChart3 className="w-4 h-4 text-[#84cc16]" />
            <span>Sector Volume vs Closed Wins Breakdown</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Comparative grouped telemetry by service offering. Click a sector to isolate.
          </p>
        </div>

        {/* Sorting & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-stone-100 dark:bg-stone-900 border border-black dark:border-stone-700 rounded-lg p-0.5 text-[10px] font-bold">
            <button
              onClick={() => setSortBy('total')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                sortBy === 'total' ? 'bg-black text-[#39FF14]' : 'text-stone-500 hover:text-black dark:hover:text-white'
              }`}
            >
              By Volume
            </button>
            <button
              onClick={() => setSortBy('conversionRate')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                sortBy === 'conversionRate' ? 'bg-black text-[#39FF14]' : 'text-stone-500 hover:text-black dark:hover:text-white'
              }`}
            >
              By Win Rate
            </button>
            <button
              onClick={() => setSortBy('converted')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                sortBy === 'converted' ? 'bg-black text-[#39FF14]' : 'text-stone-500 hover:text-black dark:hover:text-white'
              }`}
            >
              By Won Deals
            </button>
          </div>

          {selectedService !== 'ALL' && (
            <button
              onClick={() => onSelectService?.('ALL')}
              className="text-[10px] font-bold px-2 py-1 bg-stone-200 dark:bg-stone-800 rounded border border-black/20 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Filter className="w-3 h-3 text-[#84cc16]" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bar Chart Body */}
      <div className="space-y-4 my-2">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-stone-500 animate-pulse space-y-2">
            <div className="w-8 h-8 mx-auto border-2 border-t-[#39FF14] border-stone-300 rounded-full animate-spin" />
            <div>Calculating sector telemetry across permanent records...</div>
          </div>
        ) : sortedList.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            No sector transmissions recorded yet.
          </div>
        ) : (
          sortedList.map((item) => {
            const isSelected = selectedService === item.service;
            const isHovered = hoveredService === item.service;
            const label = SERVICE_LABELS[item.service] || item.service.replace(/_/g, ' ');

            const totalWidthPct = Math.round(((item.total || 0) / maxTotal) * 100);
            const convertedWidthPct = item.total > 0
              ? Math.round(((item.converted || 0) / maxTotal) * 100)
              : 0;

            return (
              <div
                key={item.service}
                onMouseEnter={() => setHoveredService(item.service)}
                onMouseLeave={() => setHoveredService(null)}
                onClick={() => onSelectService?.(isSelected ? 'ALL' : item.service)}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#39FF14]/10 dark:bg-[#39FF14]/5 border-black dark:border-[#39FF14] shadow-[3px_3px_0px_#000]'
                    : isHovered
                    ? 'bg-stone-100 dark:bg-stone-800/80 border-black/40 dark:border-stone-600'
                    : 'bg-white dark:bg-[#1e1e24] border-black/10 dark:border-stone-800 hover:border-black/30'
                }`}
              >
                {/* Sector Header Line */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-sm border border-black/30 transition-transform ${
                        isSelected ? 'bg-[#39FF14] scale-125' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    />
                    <span className="font-bold text-black dark:text-white tracking-tight">
                      {label}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] bg-black text-[#39FF14] px-1.5 py-0.5 rounded font-black tracking-wide uppercase">
                        Active Filter
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono-tech text-[11px]">
                    <span className="text-stone-500">
                      <strong className="text-black dark:text-white">{item.total}</strong> inq
                    </span>
                    <span className="text-[#10b981] font-bold">
                      <strong>{item.converted}</strong> won
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-black/20 text-black dark:text-white font-black text-[10px]">
                      {item.conversionRate}% Win
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                  </div>
                </div>

                {/* Comparative Double Bars */}
                <div className="space-y-1.5">
                  {/* Total Inquiries Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-stone-400 w-12 font-bold uppercase truncate">
                      Volume
                    </span>
                    <div className="flex-1 h-3 bg-stone-100 dark:bg-stone-900 rounded-md overflow-hidden border border-black/10 dark:border-stone-800 relative">
                      <div
                        className="h-full bg-gradient-to-r from-stone-400 to-stone-600 dark:from-stone-600 dark:to-stone-400 rounded-md transition-all duration-500"
                        style={{ width: `${Math.max(totalWidthPct, 3)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 w-8 text-right font-bold">
                      {item.total}
                    </span>
                  </div>

                  {/* Converted Retainers Bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-[#10b981] w-12 font-bold uppercase truncate">
                      Won
                    </span>
                    <div className="flex-1 h-3 bg-stone-100 dark:bg-stone-900 rounded-md overflow-hidden border border-black/10 dark:border-stone-800 relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#84cc16] to-[#10b981] rounded-md transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.max(convertedWidthPct, item.converted > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-[#10b981] w-8 text-right font-black">
                      {item.converted}
                    </span>
                  </div>
                </div>

                {/* Sub-breakdown details on hover or selection */}
                {(isSelected || isHovered) && (
                  <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500">
                    <span>Qualified Pipeline: <strong>{item.qualified || 0}</strong></span>
                    <span>Closed / Lost: <strong>{item.lost || 0}</strong></span>
                    <span className="text-black dark:text-white font-bold">
                      Click to {isSelected ? 'clear sector filter' : 'focus dashboard'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chart Legend */}
      <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-stone-500 rounded-sm inline-block" />
            <span>Total Inquiry Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-gradient-to-r from-[#84cc16] to-[#10b981] rounded-sm inline-block" />
            <span className="font-bold text-[#10b981]">Converted Deals</span>
          </div>
        </div>

        <div className="text-[10px] text-stone-400">
          Click any sector row to filter all dashboard telemetry
        </div>
      </div>

    </div>
  );
}
