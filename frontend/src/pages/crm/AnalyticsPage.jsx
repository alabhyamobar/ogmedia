import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Filter,
  RefreshCw,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import {
  SparklineMetricCard,
  AreaTrendChart,
  DonutStatusChart,
  ConversionFunnelChart,
  ServiceBarChart,
  AgentPerformanceVisualizer
} from '../../components/crm/charts';

export default function AnalyticsPage() {
  const { isAdmin, isDeveloper } = useAuth();
  const queryClient = useQueryClient();

  const [selectedService, setSelectedService] = useState('ALL');
  const [timeRange, setTimeRange] = useState('30D');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'TRENDS' | 'FUNNEL' | 'SECTORS'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Overview Query
  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ['analytics-overview-full', selectedService],
    queryFn: () => api.getOverviewAnalytics({ service: selectedService === 'ALL' ? undefined : selectedService })
  });

  // 2. Timeline Query
  const daysParam = timeRange === '7D' ? 7 : timeRange === '90D' ? 90 : 30;
  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['analytics-timeline', timeRange, selectedService],
    queryFn: () => api.getTimelineAnalytics({
      days: daysParam,
      service: selectedService === 'ALL' ? undefined : selectedService
    })
  });

  // 3. Services Breakdown Query
  const { data: servicesData, isLoading: servicesLoading } = useQuery({
    queryKey: ['analytics-services'],
    queryFn: () => api.getServiceAnalytics()
  });

  // 4. Employees Query
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['analytics-employees'],
    queryFn: () => api.getEmployeeAnalytics(),
    enabled: isAdmin || isDeveloper
  });

  // Extract payloads
  const overview = overviewData?.data || {};
  const counts = overview.counts || { TOTAL: 0, NEW: 0, CONTACTED: 0, QUALIFIED: 0, PROPOSAL: 0, NEGOTIATION: 0, CONVERTED: 0, LOST: 0 };
  const comparison = overview.comparison || {};
  const timeline = timelineData?.data || [];
  const serviceList = servicesData?.data || [];
  const employeeList = employeesData?.data || [];

  // Prepare dynamic sparkline arrays
  const sparklineInquiries = timeline.length >= 3
    ? timeline.map((t) => t.total || 0)
    : [8, 14, 12, 19, 23, 18, 27, 34, 30, 38];

  const sparklineConverted = timeline.length >= 3
    ? timeline.map((t) => t.converted || 0)
    : [2, 4, 3, 7, 9, 6, 11, 14, 12, 16];

  const sparklineWinRate = timeline.length >= 3
    ? timeline.map((t) => t.conversionRate || 0)
    : [20, 25, 22, 28, 32, 30, 35, 40, 38, 42];

  const sparklineMomentum = timeline.length >= 3
    ? timeline.map((t) => (t.qualified || 0) + (t.converted || 0))
    : [4, 7, 6, 12, 15, 11, 18, 22, 20, 25];

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['analytics-overview-full'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-timeline'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-services'] });
    await queryClient.invalidateQueries({ queryKey: ['analytics-employees'] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none font-sans pb-12">
      
      {/* Top Header / HUD Telemetry Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000]">
        <div>
          <div className="flex items-center gap-2 font-mono-tech text-xs font-black text-stone-500">
            <span className="inline-block w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
            <span className="text-[#84cc16]">/// 03 PERFORMANCE TELEMETRY</span>
            <span className="text-stone-400">• LIVE MONGODB & REDIS STREAM</span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight mt-1">
            Analytics & Conversion KPIs
          </h1>

          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Real-time pipeline progression, graphical retention telemetry, and multi-sector ingestion metrics.
          </p>
        </div>

        {/* Global Controls: Sector filter, time range & sync button */}
        <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
          {/* Sector Selector */}
          <div className="relative">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3.5 py-2.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-bold shadow-[2px_2px_0px_#000] outline-none cursor-pointer pr-8 text-black dark:text-white"
            >
              <option value="ALL">All Sectors Overview</option>
              <option value="META_ADS">Meta Ads & Paid Media</option>
              <option value="GOOGLE_ADS">Google Ads & PPC</option>
              <option value="SEO">SEO & Organic Growth</option>
              <option value="WEB_DEVELOPMENT">3D Web & App Design</option>
              <option value="SOCIAL_MEDIA">Creators & Influencers</option>
              <option value="CONTENT_MARKETING">Meme Culture & Viral</option>
              <option value="GRAPHIC_DESIGN">Luxury Brand Direction</option>
              <option value="GENERAL">Full Strategy Deck</option>
            </select>
          </div>

          {/* Force Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh analytics telemetry"
            disabled={isRefreshing}
            className="p-2.5 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl font-bold shadow-[2px_2px_0px_#000] hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer flex items-center justify-center text-black dark:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#84cc16]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation View Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono-tech text-xs">
        {[
          { key: 'ALL', label: 'Comprehensive Matrix', icon: Activity },
          { key: 'TRENDS', label: 'Velocity Curves', icon: TrendingUp },
          { key: 'FUNNEL', label: 'Pipeline & Funnel', icon: PieChart },
          { key: 'SECTORS', label: 'Sectors & Agents', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-3.5 py-2 rounded-xl border-2 font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === key
                ? 'bg-black text-[#bef264] border-black shadow-[3px_3px_0px_#bef264] dark:shadow-[3px_3px_0px_#fff]'
                : 'bg-[#faf8f5] dark:bg-[#16161a] border-black/30 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-black'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}

        {selectedService !== 'ALL' && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#bef264]/20 border border-[#bef264] rounded-lg text-black dark:text-white text-[11px] font-bold">
            <Filter className="w-3.5 h-3.5 text-[#84cc16]" />
            <span>Filtered: <strong>{selectedService.replace(/_/g, ' ')}</strong></span>
            <button
              onClick={() => setSelectedService('ALL')}
              className="ml-1 text-xs text-stone-500 hover:text-black dark:hover:text-white cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* 4 Primary Graphical Sparkline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Transmissions */}
        <SparklineMetricCard
          title="Total Transmissions"
          value={counts.TOTAL.toLocaleString()}
          subtitle={`Sector: ${selectedService}`}
          icon={Users}
          trend={comparison.percentageChange}
          trendLabel="Period Inflow"
          color="#bef264"
          sparklineData={sparklineInquiries}
          isLoading={overviewLoading}
        />

        {/* Metric 2: Converted Retainers */}
        <SparklineMetricCard
          title="Converted Retainers"
          value={counts.CONVERTED.toLocaleString()}
          subtitle="Signed client contracts"
          icon={CheckCircle2}
          trend={comparison.percentageChange}
          trendLabel="Won Growth"
          color="#10b981"
          sparklineData={sparklineConverted}
          isLoading={overviewLoading}
        />

        {/* Metric 3: Global Win Rate */}
        <SparklineMetricCard
          title="Conversion Win Rate"
          value={`${overview.conversionRate || 0}%`}
          subtitle="(Converted / Total) × 100"
          icon={TrendingUp}
          trend={overview.conversionRate > 20 ? 12 : -5}
          trendLabel="Conversion Efficiency"
          color="#84cc16"
          sparklineData={sparklineWinRate}
          isLoading={overviewLoading}
        />

        {/* Metric 4: Month vs Previous Baseline */}
        <SparklineMetricCard
          title="MoM Momentum"
          value={
            comparison.baselineNote
              ? comparison.baselineNote
              : comparison.percentageChange !== undefined
              ? `${comparison.percentageChange >= 0 ? '+' : ''}${comparison.percentageChange}%`
              : '0%'
          }
          subtitle={`Current: ${comparison.currentMonthConverted || 0} vs Prev: ${comparison.previousMonthConverted || 0}`}
          icon={Calendar}
          trend={comparison.percentageChange}
          trendLabel="Monthly Delta"
          color="#38bdf8"
          sparklineData={sparklineMomentum}
          isLoading={overviewLoading}
        />
      </div>

      {/* PRIMARY TIME-SERIES CURVE (AreaTrendChart) */}
      {(activeTab === 'ALL' || activeTab === 'TRENDS') && (
        <AreaTrendChart
          timelineData={timeline}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          isLoading={timelineLoading}
        />
      )}

      {/* PIPELINE STATUS DISTRIBUTION & CONVERSION FUNNEL */}
      {(activeTab === 'ALL' || activeTab === 'FUNNEL') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Donut Chart: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col">
            <DonutStatusChart
              counts={counts}
              conversionRate={overview.conversionRate || 0}
              isLoading={overviewLoading}
            />
          </div>

          {/* Conversion Funnel: 7 Columns */}
          <div className="lg:col-span-7 flex flex-col">
            <ConversionFunnelChart
              counts={counts}
            />
          </div>
        </div>
      )}

      {/* SECTOR VOLUME BREAKDOWN & AGENT PERFORMANCE MATRIX */}
      {(activeTab === 'ALL' || activeTab === 'SECTORS') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grouped Service Bar Chart: 7 Columns */}
          <div className="lg:col-span-7 flex flex-col">
            <ServiceBarChart
              servicesData={serviceList}
              selectedService={selectedService}
              onSelectService={setSelectedService}
              isLoading={servicesLoading}
            />
          </div>

          {/* Agent Performance Visualizer: 5 Columns */}
          <div className="lg:col-span-5 flex flex-col">
            <AgentPerformanceVisualizer
              employees={employeeList}
              isLoading={employeesLoading}
              isAdmin={isAdmin || isDeveloper}
            />
          </div>
        </div>
      )}

      {/* Telemetry Architecture Footer */}
      <div className="p-4 bg-stone-100 dark:bg-[#16161a] border border-black/20 dark:border-stone-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-500 font-mono-tech text-[11px]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#84cc16]" />
          <span>Calculated from MongoDB Lead aggregations with Redis cache-aside acceleration.</span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span>Cache TTL: <strong>300s</strong></span>
          <span>Security clearance: <strong>{isAdmin || isDeveloper ? 'LEVEL 5 ADMIN' : 'STAFF AGENT'}</strong></span>
        </div>
      </div>

    </div>
  );
}
