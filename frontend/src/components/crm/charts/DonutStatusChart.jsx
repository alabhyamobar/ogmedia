import React, { useState, useMemo } from 'react';
import { PieChart, Info } from 'lucide-react';

export default function DonutStatusChart({
  counts = { TOTAL: 0, NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, CONVERTED: 0, LOST: 0 },
  conversionRate = 0,
  isLoading = false
}) {
  const [activeSlice, setActiveSlice] = useState(null);

  const segments = useMemo(() => {
    const total = counts.TOTAL || 1;
    const rawList = [
      {
        key: 'NEW',
        label: 'New Unassigned',
        count: counts.NEW || 0,
        color: '#bef264',
        accent: '#84cc16'
      },
      {
        key: 'CONTACTED',
        label: 'In Outreach',
        count: counts.CONTACTED || 0,
        color: '#38bdf8',
        accent: '#0284c7'
      },
      {
        key: 'QUALIFIED',
        label: 'Qualified Deal',
        count: (counts.QUALIFIED || 0) + (counts.PROPOSAL || 0) + (counts.NEGOTIATION || 0),
        color: '#c084fc',
        accent: '#9333ea'
      },
      {
        key: 'CONVERTED',
        label: 'Converted Wins',
        count: counts.CONVERTED || 0,
        color: '#10b981',
        accent: '#059669'
      },
      {
        key: 'LOST',
        label: 'Lost / Closed',
        count: (counts.LOST || 0) + (counts.CLOSED || 0),
        color: '#f43f5e',
        accent: '#e11d48'
      }
    ];

    // Filter out 0 counts if there are other segments, but keep at least 1 for display
    const filtered = rawList.filter((s) => s.count > 0);
    const displayList = filtered.length > 0 ? filtered : [
      { key: 'EMPTY', label: 'No Transmissions', count: 1, color: '#78716c', accent: '#57534e' }
    ];

    const currentTotal = displayList.reduce((acc, s) => acc + s.count, 0) || 1;

    let cumulativeAngle = 0;
    return displayList.map((seg) => {
      const percentage = Math.round((seg.count / currentTotal) * 100);
      const angle = (seg.count / currentTotal) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      return {
        ...seg,
        percentage,
        startAngle,
        endAngle
      };
    });
  }, [counts]);

  // Geometry
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const strokeWidth = 28;

  // Polar to Cartesian conversion
  const polarToCartesian = (cx, cy, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians)
    };
  };

  // SVG Arc generator
  const createArc = (startAngle, endAngle, r) => {
    // Clamp to 359.99 to avoid degenerate full-circle SVG artifact
    const clampedEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
    const start = polarToCartesian(center, center, r, clampedEnd);
    const end = polarToCartesian(center, center, r, startAngle);
    const largeArcFlag = clampedEnd - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const currentHovered = activeSlice !== null ? segments[activeSlice] : null;

  return (
    <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] relative overflow-hidden font-mono-tech select-none flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3 mb-4">
        <span className="font-black text-xs uppercase flex items-center gap-1.5 text-black dark:text-white">
          <PieChart className="w-4 h-4 text-[#84cc16]" />
          <span>Pipeline Status Distribution</span>
        </span>
        <span className="text-[10px] text-stone-500">Live Breakdown</span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-2">
        {/* SVG Donut */}
        <div className="relative w-[260px] h-[260px] flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-stone-200 dark:text-stone-800"
            />

            {/* Arc segments */}
            {segments.map((seg, idx) => {
              const isSelected = activeSlice === idx;
              const currentR = isSelected ? radius + 4 : radius;
              const currentWidth = isSelected ? strokeWidth + 6 : strokeWidth;

              return (
                <path
                  key={seg.key}
                  d={createArc(seg.startAngle, seg.endAngle, currentR)}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={currentWidth}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isSelected ? `drop-shadow(0px 0px 8px ${seg.color})` : 'none'
                  }}
                  onMouseEnter={() => setActiveSlice(idx)}
                  onMouseLeave={() => setActiveSlice(null)}
                />
              );
            })}
          </svg>

          {/* Center Hub Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
            {currentHovered ? (
              <div className="space-y-0.5 animate-fadeIn">
                <div
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1 border border-black/30"
                  style={{ backgroundColor: currentHovered.color, color: '#000' }}
                >
                  {currentHovered.label}
                </div>
                <div className="text-2xl font-black text-black dark:text-white">
                  {currentHovered.count}
                </div>
                <div className="text-[10px] font-bold text-stone-500">
                  {currentHovered.percentage}% of Pipeline
                </div>
              </div>
            ) : (
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  Win Rate
                </div>
                <div className="text-3xl font-black text-black dark:text-white tracking-tight">
                  {conversionRate}%
                </div>
                <div className="text-[10px] text-stone-400 font-bold">
                  {counts.TOTAL || 0} Total Leads
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full flex-1 space-y-2">
          {segments.map((seg, idx) => {
            const isSelected = activeSlice === idx;
            return (
              <div
                key={seg.key}
                onMouseEnter={() => setActiveSlice(idx)}
                onMouseLeave={() => setActiveSlice(null)}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isSelected
                    ? 'bg-stone-200 dark:bg-stone-800 border-black dark:border-stone-500 shadow-sm translate-x-1'
                    : 'bg-white dark:bg-[#1a1a20] border-black/10 dark:border-stone-800 hover:border-black/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-md flex-shrink-0 border border-black/30"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="font-bold text-black dark:text-white truncate max-w-[130px]">
                    {seg.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono-tech text-[11px]">
                  <span className="font-bold text-black dark:text-white">{seg.count}</span>
                  <span className="text-stone-400 text-[10px]">({seg.percentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
        <span>Hover segment to isolate state</span>
        <span className="font-bold text-[#10b981]">Real-time Sync</span>
      </div>

    </div>
  );
}
