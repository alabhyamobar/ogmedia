import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function SparklineMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = '#bef264',
  sparklineData = [12, 18, 15, 24, 28, 22, 35, 42, 38, 48],
  isLoading = false
}) {
  // Generate SVG path for sparkline
  const width = 120;
  const height = 36;
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData) || 1;
  const range = max - min || 1;

  const points = sparklineData.map((val, idx) => {
    const x = (idx / (sparklineData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return { x, y };
  });

  const linePath = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + pt.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${pt.y} ${pt.x},${pt.y}`;
  }, '');

  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="bg-[#faf8f5] dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-2xl p-5 shadow-[4px_4px_0px_#000] relative overflow-hidden flex flex-col justify-between transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between text-stone-500 text-xs font-bold font-mono-tech uppercase">
        <span className="tracking-wider">{title}</span>
        {Icon && (
          <div
            className="p-1.5 rounded-lg border border-black/20 dark:border-stone-700"
            style={{ backgroundColor: `${color}20`, color: color === '#bef264' ? '#111' : color }}
          >
            <Icon className="w-4 h-4 text-black dark:text-white" />
          </div>
        )}
      </div>

      <div className="my-2 flex items-end justify-between gap-2">
        <div>
          <div className="text-3xl font-black text-black dark:text-white font-mono-tech tracking-tight">
            {isLoading ? (
              <span className="inline-block w-16 h-8 bg-stone-200 dark:bg-stone-800 rounded animate-pulse" />
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <div className="text-[11px] text-stone-500 font-mono-tech mt-0.5 truncate max-w-[140px]">
              {subtitle}
            </div>
          )}
        </div>

        {/* Mini Sparkline Visualization */}
        <div className="relative w-[120px] h-[36px] overflow-hidden flex-shrink-0">
          <svg width={width} height={height} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id={`sparkGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={areaPath}
              fill={`url(#sparkGrad-${title.replace(/\s+/g, '')})`}
            />
            <path
              d={linePath}
              fill="none"
              stroke={color === '#bef264' ? '#84cc16' : color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3"
                fill={color === '#bef264' ? '#84cc16' : color}
                stroke="#000"
                strokeWidth="1"
              />
            )}
          </svg>
        </div>
      </div>

      {trend !== undefined && (
        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between font-mono-tech text-[10px]">
          <span className="text-stone-500 truncate">{trendLabel || 'Momentum'}</span>
          <span
            className={`font-black flex items-center gap-0.5 ${
              trend >= 0 ? 'text-[#16a34a]' : 'text-[#ef4444]'
            }`}
          >
            {trend >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend > 0 ? `+${trend}%` : `${trend}%`}</span>
          </span>
        </div>
      )}
    </div>
  );
}
