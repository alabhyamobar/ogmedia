import React, { useState } from 'react';
import { Filter, ArrowDown, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ConversionFunnelChart({
  counts = { TOTAL: 0, NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, NEGOTIATION: 0, CONVERTED: 0, LOST: 0 }
}) {
  const [hoveredStage, setHoveredStage] = useState(null);

  const total = counts.TOTAL || 0;
  const contacted = (counts.CONTACTED || 0) + (counts.QUALIFIED || 0) + (counts.PROPOSAL || 0) + (counts.NEGOTIATION || 0) + (counts.CONVERTED || 0);
  const qualified = (counts.QUALIFIED || 0) + (counts.PROPOSAL || 0) + (counts.NEGOTIATION || 0) + (counts.CONVERTED || 0);
  const proposal = (counts.PROPOSAL || 0) + (counts.NEGOTIATION || 0) + (counts.CONVERTED || 0);
  const converted = counts.CONVERTED || 0;

  const stages = [
    {
      id: 'ingestion',
      name: '1. Ingestion',
      desc: 'Total leads received',
      count: total,
      pctOfTotal: 100,
      color: '#39FF14',
      barColor: 'bg-[#39FF14]',
      textColor: 'text-black'
    },
    {
      id: 'contact',
      name: '2. Contacted',
      desc: 'First response initiated',
      count: contacted,
      pctOfTotal: total > 0 ? Math.round((contacted / total) * 100) : 0,
      color: '#38bdf8',
      barColor: 'bg-[#38bdf8]',
      textColor: 'text-black'
    },
    {
      id: 'qualified',
      name: '3. Qualified',
      desc: 'Budget & scope verified',
      count: qualified,
      pctOfTotal: total > 0 ? Math.round((qualified / total) * 100) : 0,
      color: '#c084fc',
      barColor: 'bg-[#c084fc]',
      textColor: 'text-black'
    },
    {
      id: 'proposal',
      name: '4. Proposal / Pitch',
      desc: 'Terms & scope drafted',
      count: proposal,
      pctOfTotal: total > 0 ? Math.round((proposal / total) * 100) : 0,
      color: '#fbbf24',
      barColor: 'bg-[#fbbf24]',
      textColor: 'text-black'
    },
    {
      id: 'converted',
      name: '5. Retainer Closed',
      desc: 'Contract signed & won',
      count: converted,
      pctOfTotal: total > 0 ? Math.round((converted / total) * 100) : 0,
      color: '#10b981',
      barColor: 'bg-[#10b981]',
      textColor: 'text-black'
    }
  ];

  return (
    <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] relative overflow-hidden font-mono-tech select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3 mb-4">
        <div>
          <span className="font-black text-xs uppercase flex items-center gap-1.5 text-black dark:text-white">
            <Filter className="w-4 h-4 text-[#84cc16]" />
            <span>Acquisition Funnel & Drop-off Telemetry</span>
          </span>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Conversion retention and drop-off rates across each milestone.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-2 py-1 rounded font-black text-[#10b981]">
            Global Win: {total > 0 ? Math.round((converted / total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Funnel Stage Bars */}
      <div className="space-y-3.5 my-2">
        {stages.map((stage, idx) => {
          const isHovered = hoveredStage === stage.id;
          const prevCount = idx > 0 ? stages[idx - 1].count : null;
          const dropOffPct = prevCount !== null && prevCount > 0
            ? Math.round(((prevCount - stage.count) / prevCount) * 100)
            : 0;

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                isHovered
                  ? 'bg-stone-100 dark:bg-stone-800 border-black dark:border-white shadow-md'
                  : 'bg-white dark:bg-[#1e1e24] border-black/20 dark:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/30"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="font-black text-black dark:text-white">
                    {stage.name}
                  </span>
                  <span className="text-stone-400 text-[10px] hidden sm:inline">
                    ({stage.desc})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {idx > 0 && dropOffPct > 0 && (
                    <span className="text-[10px] text-[#ef4444] font-bold">
                      -{dropOffPct}% drop
                    </span>
                  )}
                  <span className="text-sm font-black text-black dark:text-white">
                    {stage.count} <span className="text-[10px] text-stone-500 font-normal">leads</span>
                  </span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-black text-[#39FF14]">
                    {stage.pctOfTotal}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-3 bg-stone-200 dark:bg-stone-900 rounded-full overflow-hidden border border-black/20 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.barColor}`}
                  style={{
                    width: `${Math.max(stage.pctOfTotal, 3)}%`,
                    filter: isHovered ? 'brightness(1.1)' : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Funnel Health Summary */}
      <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
        <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg border border-black/10 dark:border-stone-800">
          <div className="text-stone-400 uppercase">Input Volume</div>
          <div className="font-black text-sm text-black dark:text-white">{total}</div>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg border border-black/10 dark:border-stone-800">
          <div className="text-stone-400 uppercase">Qualify Ratio</div>
          <div className="font-black text-sm text-[#38bdf8]">{total > 0 ? Math.round((qualified / total) * 100) : 0}%</div>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg border border-black/10 dark:border-stone-800">
          <div className="text-stone-400 uppercase">Pitch Closure</div>
          <div className="font-black text-sm text-[#fbbf24]">{proposal > 0 ? Math.round((converted / proposal) * 100) : 0}%</div>
        </div>
        <div className="p-2 bg-stone-100 dark:bg-stone-900 rounded-lg border border-black/10 dark:border-stone-800">
          <div className="text-stone-400 uppercase">Total Retainers</div>
          <div className="font-black text-sm text-[#10b981]">{converted}</div>
        </div>
      </div>

    </div>
  );
}
