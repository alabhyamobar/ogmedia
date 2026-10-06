import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Settings,
  Lock,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  Cpu,
  Layers,
  RefreshCw,
  Bug,
  Trash2,
  Terminal,
  Code2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  ShieldAlert,
  Clock,
  HardDrive
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isAdmin, isDeveloper } = useAuth();
  const hasDebugAccess = isDeveloper;

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [activeTab, setActiveTab] = useState(isDeveloper ? 'debug' : 'diagnostics');
  const [errorFilter, setErrorFilter] = useState('ALL');
  const [expandedErrors, setExpandedErrors] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const {
    data: healthData,
    isLoading: healthLoading,
    isFetching: healthFetching,
    refetch
  } = useQuery({
    queryKey: ['system-health-diagnostics'],
    queryFn: () => api.getSystemHealth(),
    enabled: isDeveloper,
    refetchInterval: 8000
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      api.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordError(null);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (err) => {
      setPasswordError(err.message || 'Failed to change password');
    }
  });

  const clearErrorsMutation = useMutation({
    mutationFn: () => api.clearSystemErrors(),
    onSuccess: () => {
      refetch();
    }
  });

  const triggerTestErrorMutation = useMutation({
    mutationFn: () => api.triggerTestError(),
    onSettled: () => {
      setTimeout(() => refetch(), 300);
    }
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const toggleErrorExpand = (id) => {
    setExpandedErrors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const system = healthData?.data?.system || {};
  const database = healthData?.data?.database || {};
  const redis = healthData?.data?.redis || {};
  const queue = healthData?.data?.queue || {};
  const errorsData = healthData?.data?.errors || { totalCount: 0, recent: [] };
  const rawErrors = errorsData.recent || [];

  const filteredErrors = rawErrors.filter((err) => {
    if (errorFilter === '5xx') return err.statusCode >= 500;
    if (errorFilter === '4xx') return err.statusCode >= 400 && err.statusCode < 500;
    return true;
  });

  const heapUsed = system.memoryUsage?.heapUsedMB || 0;
  const heapTotal = system.memoryUsage?.heapTotalMB || 1;
  const memoryPct = Math.min(Math.round((heapUsed / heapTotal) * 100), 100);

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
              Console Access Restricted
            </h2>
          </div>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            System & Configuration telemetry and low-level diagnostic controls are locked under enterprise security compliance policies.
          </p>
          <div className="pt-3">
            <Link
              to="/crm/dashboard"
              className="inline-flex items-center gap-2 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-bold text-xs px-5 py-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] transition-transform hover:scale-105 active:scale-95"
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
    <div className="space-y-6 sm:space-y-8 select-none font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs font-bold text-stone-500 flex items-center gap-2">
            <span>/// 06 SYSTEM PARAMETERS & CONFIG</span>
            {isDeveloper && (
              <span className="bg-[#a855f7] text-white px-2 py-0.2 rounded font-black text-[10px] tracking-wide">
                ⚡ DEVELOPER ROOT
              </span>
            )}
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            {isDeveloper ? 'Developer Console & System Debug' : 'Settings & Infrastructure Telemetry'}
          </h1>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
            {isDeveloper
              ? 'Real-time exception tracing, queue inspection, process telemetry, and runtime debug controls.'
              : 'Personal credentials, account security, and real-time distributed ingestion pipeline telemetry.'}
          </p>
        </div>

        {hasDebugAccess && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => triggerTestErrorMutation.mutate()}
              disabled={triggerTestErrorMutation.isPending}
              title="Simulate a live exception to verify error handling"
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500 text-amber-800 dark:text-amber-300 hover:text-black border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs font-bold manga-shadow-sm transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>TEST ERROR TRIGGER</span>
            </button>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a20] hover:bg-[#39FF14] hover:text-black border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs font-bold shadow-[2px_2px_0px_#000] transition-colors cursor-pointer"
              title="Refresh telemetry sensors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REFRESH</span>
            </button>
          </div>
        )}
      </div>

      {hasDebugAccess && (
        <div className="flex items-center gap-2 border-b-2 border-black dark:border-stone-700 pb-2 font-mono-tech text-xs font-bold">
          <button
            onClick={() => setActiveTab('debug')}
            className={`px-3 py-1.5 border-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'debug'
                ? 'bg-black text-[#39FF14] border-black shadow-[3px_3px_0px_#39FF14]'
                : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-800'
            }`}
          >
            <Bug className="w-4 h-4 text-[#ef4444]" />
            <span>LIVE ERROR TRACER ({errorsData.totalCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 border-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'diagnostics'
                ? 'bg-black text-[#39FF14] border-black shadow-[3px_3px_0px_#39FF14]'
                : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-800'
            }`}
          >
            <Server className="w-4 h-4 text-[#38bdf8]" />
            <span>INFRASTRUCTURE & STATS</span>
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 border-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'account'
                ? 'bg-black text-[#39FF14] border-black shadow-[3px_3px_0px_#39FF14]'
                : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 border-black/30 dark:border-stone-800'
            }`}
          >
            <Lock className="w-4 h-4 text-[#39FF14]" />
            <span>PROFILE & CREDENTIALS</span>
          </button>
        </div>
      )}

      {activeTab === 'debug' && hasDebugAccess && (
        <div className="space-y-6">
          
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-4 sm:p-5 shadow-[5px_5px_0px_#000] flex flex-wrap items-center justify-between gap-4 font-mono-tech text-xs">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase text-stone-600 dark:text-stone-400">FILTER LOGS:</span>
              <button
                onClick={() => setErrorFilter('ALL')}
                className={`px-2.5 py-1 rounded border font-bold ${
                  errorFilter === 'ALL'
                    ? 'bg-black text-[#39FF14] border-black'
                    : 'bg-white dark:bg-[#1a1a20] border-black/30'
                }`}
              >
                ALL ({rawErrors.length})
              </button>
              <button
                onClick={() => setErrorFilter('5xx')}
                className={`px-2.5 py-1 rounded border font-bold ${
                  errorFilter === '5xx'
                    ? 'bg-[#ef4444] text-white border-black'
                    : 'bg-white dark:bg-[#1a1a20] border-black/30'
                }`}
              >
                5xx FATAL ({rawErrors.filter((e) => e.statusCode >= 500).length})
              </button>
              <button
                onClick={() => setErrorFilter('4xx')}
                className={`px-2.5 py-1 rounded border font-bold ${
                  errorFilter === '4xx'
                    ? 'bg-amber-500 text-black border-black'
                    : 'bg-white dark:bg-[#1a1a20] border-black/30'
                }`}
              >
                4xx CLIENT ({rawErrors.filter((e) => e.statusCode >= 400 && e.statusCode < 500).length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              {rawErrors.length > 0 && (
                <button
                  onClick={() => clearErrorsMutation.mutate()}
                  disabled={clearErrorsMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white border border-[#ef4444] rounded-lg transition-colors cursor-pointer font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>CLEAR ERROR BUFFER</span>
                </button>
              )}
            </div>
          </div>

          {filteredErrors.length === 0 ? (
            <div className="p-12 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[5px_5px_0px_#000] text-center space-y-3 font-mono-tech">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#16a34a]/20 border-2 border-[#16a34a] text-[#16a34a] flex items-center justify-center font-black">
                ✓
              </div>
              <h3 className="font-heading font-black text-lg text-black dark:text-white uppercase">
                ZERO EXCEPTIONS RECORDED
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No active runtime errors or API rejections detected in the circular buffer. Click <span className="font-bold text-black dark:text-white">"TEST ERROR TRIGGER"</span> above to simulate an exception.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredErrors.map((err) => {
                const isExpanded = !!expandedErrors[err.id];
                const is5xx = err.statusCode >= 500;

                return (
                  <div
                    key={err.id}
                    className={`bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] font-mono-tech space-y-3 transition-colors ${
                      is5xx ? 'border-l-[6px] border-l-[#ef4444]' : 'border-l-[6px] border-l-amber-500'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 dark:border-stone-800 pb-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-black px-2 py-0.5 rounded text-[11px] ${
                            is5xx ? 'bg-[#ef4444] text-white' : 'bg-amber-500 text-black'
                          }`}
                        >
                          {err.statusCode} // {err.code}
                        </span>

                        {err.method && (
                          <span className="bg-black text-[#39FF14] px-1.5 py-0.5 rounded font-black text-[10px]">
                            {err.method}
                          </span>
                        )}

                        <span className="font-bold text-stone-800 dark:text-stone-200">
                          {err.url || 'Internal Runtime'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-stone-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(err.timestamp).toLocaleTimeString()} ({new Date(err.timestamp).toLocaleDateString()})</span>
                      </div>
                    </div>

                    <div className="text-sm font-black text-[#ef4444] break-words">
                      {err.message}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px]">
                      {err.requestId && (
                        <button
                          onClick={() => copyToClipboard(err.requestId, err.id)}
                          className="bg-white dark:bg-[#1e1e24] px-2 py-1 rounded border border-black/20 dark:border-stone-700 flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:border-black cursor-pointer"
                          title="Click to copy request ID"
                        >
                          <span>REQ:</span>
                          <code className="font-bold">{err.requestId.substring(0, 14)}...</code>
                          {copiedId === err.id ? <Check className="w-3 h-3 text-[#16a34a]" /> : <Copy className="w-3 h-3 text-stone-400" />}
                        </button>
                      )}

                      {err.user && (
                        <span className="bg-white dark:bg-[#1e1e24] px-2 py-1 rounded border border-black/20 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                          AGENT: <span className="font-bold text-black dark:text-white">@{err.user.username}</span> [{err.user.role}]
                        </span>
                      )}

                      {err.ip && (
                        <span className="bg-white dark:bg-[#1e1e24] px-2 py-1 rounded border border-black/20 dark:border-stone-700 text-stone-500">
                          IP: {err.ip}
                        </span>
                      )}

                      <button
                        onClick={() => toggleErrorExpand(err.id)}
                        className="ml-auto bg-stone-200 dark:bg-stone-800 hover:bg-[#39FF14] hover:text-black px-2.5 py-1 rounded font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{isExpanded ? 'HIDE STACK TRACE' : 'INSPECT STACK TRACE'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-black/10 dark:border-stone-800 space-y-3">
                        {err.body && (
                          <div>
                            <div className="text-[10px] font-bold text-stone-500 mb-1">REQUEST BODY:</div>
                            <pre className="p-3 bg-black text-[#39FF14] text-[10px] rounded-xl overflow-x-auto max-h-36">
                              {JSON.stringify(err.body, null, 2)}
                            </pre>
                          </div>
                        )}

                        {err.stack ? (
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 mb-1">
                              <span>EXCEPTION CALL STACK:</span>
                              <button
                                onClick={() => copyToClipboard(err.stack, `stack_${err.id}`)}
                                className="flex items-center gap-1 hover:text-black dark:hover:text-white cursor-pointer"
                              >
                                {copiedId === `stack_${err.id}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#16a34a]" />
                                    <span>COPIED</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>COPY STACK</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 bg-black text-stone-300 text-[10px] rounded-xl overflow-x-auto max-h-60 leading-relaxed font-mono">
                              {err.stack}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-[10px] text-stone-400 italic">
                            No stack trace attached to this exception.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {(activeTab === 'diagnostics' || !hasDebugAccess) && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-tech">
            
            <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
                <span className="font-black text-xs uppercase flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#39FF14]" />
                  <span>PROCESS ENGINE</span>
                </span>
                <span className="bg-[#16a34a] text-white text-[10px] px-2 py-0.5 rounded font-black">
                  ONLINE
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Node.js Version:</span>
                  <span className="font-black">{system.nodeVersion || 'Sampling...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Host Platform:</span>
                  <span className="font-bold">{system.platform} ({system.arch})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Process PID:</span>
                  <span className="font-bold">{system.pid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Uptime:</span>
                  <span className="font-black text-[#16a34a]">{system.uptimeSeconds}s ({Math.floor((system.uptimeSeconds || 0) / 60)} min)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Environment:</span>
                  <span className="font-black uppercase">{system.environment || 'development'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/10 dark:border-stone-800 space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span>Heap Memory:</span>
                  <span>{heapUsed} / {heapTotal} MB ({memoryPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden border border-black/20">
                  <div
                    className={`h-full transition-all duration-300 ${
                      memoryPct > 85 ? 'bg-[#ef4444]' : memoryPct > 65 ? 'bg-amber-400' : 'bg-[#39FF14]'
                    }`}
                    style={{ width: `${memoryPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>Process RSS: {system.memoryUsage?.rssMB} MB</span>
                  <span>External: {system.memoryUsage?.externalMB} MB</span>
                </div>
              </div>
            </div>

            <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
                <span className="font-black text-xs uppercase flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#38bdf8]" />
                  <span>MONGODB CLUSTER</span>
                </span>
                <span className="bg-[#16a34a] text-white text-[10px] px-2 py-0.5 rounded font-black">
                  {database.status || 'CONNECTED'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Database Name:</span>
                  <span className="font-black text-black dark:text-white">{database.dbName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-stone-500">Cluster Host:</span>
                  <span className="font-bold text-[11px] truncate text-stone-700 dark:text-stone-300">{database.host}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Connection State:</span>
                  <span className="font-black text-[#16a34a]">ReadyState: {database.readyState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Schemas Registered:</span>
                  <span className="font-bold">{database.modelsRegistered} active models</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Connection Pool:</span>
                  <span className="font-bold">{database.minPoolSize} min / {database.maxPoolSize} max</span>
                </div>
              </div>
            </div>

            <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
                <span className="font-black text-xs uppercase flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#39FF14]" />
                  <span>REDIS STREAMS BUFFER</span>
                </span>
                <span
                  className={`text-white text-[10px] px-2 py-0.5 rounded font-black ${
                    redis.status === 'UP' ? 'bg-[#16a34a]' : 'bg-[#ef4444]'
                  }`}
                >
                  {redis.status === 'UP' ? 'BUFFER ACTIVE' : 'DISCONNECTED'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Stream Name:</span>
                  <code className="font-black text-black dark:text-white">{queue.streamName}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Consumer Group:</span>
                  <code className="font-bold text-stone-700 dark:text-stone-300">{queue.consumerGroup}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Queue Length:</span>
                  <span className="font-black text-lg text-black dark:text-white">{queue.queueLength ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Pending In PEL:</span>
                  <span className="font-black text-lg text-stone-800 dark:text-stone-200">{queue.pendingCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Dead Letter (DLQ):</span>
                  <span className="font-black text-lg text-[#ef4444]">{queue.dlqLength ?? 0}</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 sm:p-5 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[5px_5px_0px_#000] font-mono-tech text-xs space-y-3">
            <div className="font-black uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#39FF14] animate-pulse" />
              <span>DISPATCH ENGINE RUNTIME CONFIGURATION</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white dark:bg-[#1a1a20] border border-black/20 rounded-xl">
                <div className="text-[10px] text-stone-500 uppercase font-bold">Worker Concurrency</div>
                <div className="text-lg font-black text-black dark:text-white">{system.workerConcurrency || 20} Tasks</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#1a1a20] border border-black/20 rounded-xl">
                <div className="text-[10px] text-stone-500 uppercase font-bold">In-Process Worker</div>
                <div className="text-lg font-black text-[#16a34a]">{system.inProcessWorkerActive ? 'ACTIVE' : 'STANDBY'}</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#1a1a20] border border-black/20 rounded-xl">
                <div className="text-[10px] text-stone-500 uppercase font-bold">Rate Limiting</div>
                <div className="text-lg font-black text-stone-700 dark:text-stone-300">{system.rateLimitSkipped ? 'BYPASSED' : 'ACTIVE'}</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#1a1a20] border border-black/20 rounded-xl">
                <div className="text-[10px] text-stone-500 uppercase font-bold">Redis Keys Stored</div>
                <div className="text-lg font-black text-[#38bdf8]">{redis.totalKeys ?? 0} Keys</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech text-xs">
            <div className="font-black uppercase text-xs border-b-2 border-black dark:border-stone-700 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#39FF14]" />
              <span>PROFILE CLEARANCE</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Agent Name</span>
                <span className="font-black text-sm text-black dark:text-white">{user?.name}</span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Username</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">@{user?.username}</span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Email</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{user?.email}</span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Assigned Role</span>
                <span className="bg-black text-[#39FF14] px-2 py-0.5 rounded font-black text-[10px] inline-block mt-0.5">
                  {user?.role}
                </span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block mb-1">
                  Authorized Domain Clearance
                </span>
                <div className="flex flex-wrap gap-1">
                  {user?.role === 'DEVELOPER' ? (
                    <span className="bg-[#a855f7] text-white px-2 py-0.5 rounded font-black text-[10px]">
                      ⚡ GLOBAL DEVELOPER CLEARANCE (FULL DASHBOARD & DEBUG)
                    </span>
                  ) : user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                    <span className="bg-[#39FF14] text-black px-2 py-0.5 rounded font-black text-[10px]">
                      ★ ALL SECTORS (EXECUTIVE ADMINISTRATOR)
                    </span>
                  ) : (
                    (user?.expertise || []).map((srv) => (
                      <span
                        key={srv}
                        className="bg-white dark:bg-[#1e1e24] text-stone-800 dark:text-stone-200 border border-black/30 dark:border-stone-700 px-2 py-0.5 rounded font-bold text-[9px]"
                      >
                        {srv.replace('_', ' ')}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech text-xs">
            <div className="font-black uppercase text-xs border-b-2 border-black dark:border-stone-700 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#39FF14]" />
              <span>UPDATE SECURITY KEY</span>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-[#16a34a]/15 border border-[#16a34a] rounded-xl text-[#16a34a] font-bold flex items-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-[#ef4444]/15 border border-[#ef4444] rounded-xl text-[#ef4444] font-bold flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full mt-2 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-black py-2.5 px-4 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer uppercase text-xs transition-transform active:translate-y-0.5"
              >
                {changePasswordMutation.isPending ? 'UPDATING...' : 'CHANGE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
