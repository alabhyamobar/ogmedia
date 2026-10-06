import React from 'react';
import { Award, Shield, Flame } from 'lucide-react';

export default function AgentPerformanceVisualizer({
  employees = [],
  isLoading = false,
  isAdmin = false
}) {
  if (!isAdmin) {
    return (
      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] font-mono-tech select-none flex flex-col justify-between">
        <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3 mb-4">
          <span className="font-black text-xs uppercase flex items-center gap-1.5 text-black dark:text-white">
            <Award className="w-4 h-4 text-[#84cc16]" />
            <span>Agent Performance Roster</span>
          </span>
          <span className="text-[10px] text-stone-500">Classified</span>
        </div>
        <div className="py-12 text-center text-xs text-stone-500 italic space-y-2">
          <Shield className="w-8 h-8 mx-auto text-stone-400" />
          <div>Employee leaderboard is restricted to administrative clearance.</div>
        </div>
      </div>
    );
  }

  // Sort by win rate & converted
  const sortedEmployees = [...employees].sort((a, b) => {
    if ((b.converted || 0) !== (a.converted || 0)) {
      return (b.converted || 0) - (a.converted || 0);
    }
    return (b.conversionRate || 0) - (a.conversionRate || 0);
  });

  return (
    <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] font-mono-tech select-none flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3 mb-4">
        <div>
          <span className="font-black text-xs uppercase flex items-center gap-1.5 text-black dark:text-white">
            <Award className="w-4 h-4 text-[#84cc16]" />
            <span>Agent Performance Matrix</span>
          </span>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Individual deal closure efficiency and active workload.
          </p>
        </div>
        <span className="text-[10px] bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded font-black text-black dark:text-white uppercase">
          {sortedEmployees.length} Agents
        </span>
      </div>

      {/* Agent Roster List */}
      <div className="space-y-3.5 my-2">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-stone-500 animate-pulse space-y-2">
            <div className="w-8 h-8 mx-auto border-2 border-t-[#39FF14] border-stone-300 rounded-full animate-spin" />
            <div>Aggregating agent telemetry...</div>
          </div>
        ) : sortedEmployees.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            No agent assignments recorded yet.
          </div>
        ) : (
          sortedEmployees.map((emp, index) => {
            const rank = index + 1;
            const rankBadge =
              rank === 1 ? 'bg-[#39FF14] text-black border-black' :
              rank === 2 ? 'bg-[#38bdf8] text-black border-black' :
              rank === 3 ? 'bg-[#c084fc] text-black border-black' :
              'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-black/20';

            const total = emp.totalLeads || 0;
            const converted = emp.converted || 0;
            const inProgress = emp.inProgress || 0;

            const convertedPct = total > 0 ? Math.round((converted / total) * 100) : 0;
            const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
            const otherPct = Math.max(0, 100 - convertedPct - inProgressPct);

            return (
              <div
                key={emp.id}
                className="p-3 bg-white dark:bg-[#1e1e24] border-2 border-black/20 dark:border-stone-700 rounded-xl space-y-2 transition-all hover:border-black dark:hover:border-stone-500 shadow-sm"
              >
                {/* Agent Header Line */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-black text-[10px] border ${rankBadge}`}>
                      {rank === 1 ? <Flame className="w-3 h-3 text-black" /> : `#${rank}`}
                    </span>
                    <div>
                      <div className="font-black text-black dark:text-white flex items-center gap-1.5">
                        <span>{emp.name}</span>
                        {emp.role === 'ADMIN' && (
                          <span className="text-[9px] px-1 bg-stone-200 dark:bg-stone-800 rounded font-normal text-stone-600 dark:text-stone-400">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        @{emp.username} • {emp.expertise?.slice(0, 2).join(', ') || 'Growth Ops'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-[#10b981]">
                      {emp.conversionRate}%
                    </div>
                    <div className="text-[9px] text-stone-400 uppercase font-bold">
                      Win Rate
                    </div>
                  </div>
                </div>

                {/* Graphical Workload Distribution Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden flex border border-black/10">
                    {convertedPct > 0 && (
                      <div
                        className="bg-[#10b981] h-full transition-all duration-500"
                        style={{ width: `${convertedPct}%` }}
                        title={`Converted: ${converted}`}
                      />
                    )}
                    {inProgressPct > 0 && (
                      <div
                        className="bg-[#38bdf8] h-full transition-all duration-500"
                        style={{ width: `${inProgressPct}%` }}
                        title={`In Progress: ${inProgress}`}
                      />
                    )}
                    {otherPct > 0 && (
                      <div
                        className="bg-stone-300 dark:bg-stone-700 h-full transition-all duration-500"
                        style={{ width: `${otherPct}%` }}
                        title={`Other / Closed: ${total - converted - inProgress}`}
                      />
                    )}
                  </div>

                  {/* Micro stats footer */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                    <span>
                      Total: <strong className="text-black dark:text-white">{total}</strong>
                    </span>
                    <span className="text-[#38bdf8]">
                      Active: <strong>{inProgress}</strong>
                    </span>
                    <span className="text-[#10b981] font-bold">
                      Won: <strong>{converted}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Roster Legend */}
      <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Won
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#38bdf8]" /> Active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-400" /> Closed
          </span>
        </div>
        <span>Calculated from MongoDB Lead assignments</span>
      </div>

    </div>
  );
}
