import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  // Fetch system health (Admin only)
  const { data: healthData, isLoading: healthLoading, isFetching: healthFetching, refetch } = useQuery({
    queryKey: ['system-health-diagnostics'],
    queryFn: () => api.getSystemHealth(),
    enabled: isAdmin,
    refetchInterval: 10000
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

  const system = healthData?.data?.system || {};
  const database = healthData?.data?.database || {};
  const redis = healthData?.data?.redis || {};
  const queue = healthData?.data?.queue || {};

  return (
    <div className="space-y-6 sm:space-y-8 select-none font-sans">
      
      {/* Header */}
      <div>
        <div className="font-mono-tech text-xs font-bold text-stone-500">
          /// 06 SYSTEM PARAMETERS & CONFIG
        </div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
          Settings & Queue Diagnostics
        </h1>
        <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
          Personal credentials, account security, and real-time distributed ingestion pipeline telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Account & Password (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile Card */}
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech text-xs">
            <div className="font-black uppercase text-xs border-b-2 border-black dark:border-stone-700 pb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#bef264]" />
              <span>AGENT PROFILE CLEARANCE</span>
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
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Agency Email</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">{user?.email}</span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block">Assigned Role</span>
                <span className="bg-black text-[#bef264] px-2 py-0.5 rounded font-black text-[10px] inline-block mt-0.5">
                  {user?.role}
                </span>
              </div>

              <div>
                <span className="text-stone-500 uppercase font-bold text-[10px] block mb-1">
                  Authorized Domain Sectors
                </span>
                <div className="flex flex-wrap gap-1">
                  {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                    <span className="bg-[#bef264] text-black px-2 py-0.5 rounded font-black text-[10px]">
                      ★ ALL SECTORS (ADMINISTRATOR)
                    </span>
                  ) : (user?.expertise || []).length > 0 ? (
                    user.expertise.map((srv) => (
                      <span
                        key={srv}
                        className="bg-white dark:bg-[#1e1e24] text-stone-800 dark:text-stone-200 border border-black/30 dark:border-stone-700 px-2 py-0.5 rounded font-bold text-[9px]"
                      >
                        {srv.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-stone-400 italic">No assigned sectors</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech text-xs">
            <div className="font-black uppercase text-xs border-b-2 border-black dark:border-stone-700 pb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#bef264]" />
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
                className="w-full mt-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-black py-2.5 px-4 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] cursor-pointer uppercase text-xs"
              >
                {changePasswordMutation.isPending ? 'UPDATING...' : 'CHANGE PASSWORD'}
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Super Admin Queue & Infrastructure Telemetry (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-5 font-mono-tech">
            
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-[#bef264]" />
                <span className="font-black text-sm uppercase">INFRASTRUCTURE & QUEUE HEALTH</span>
              </div>

              {isAdmin && (
                <button
                  onClick={() => refetch()}
                  className="p-1.5 border border-black dark:border-stone-700 rounded bg-white dark:bg-[#1e1e24] hover:bg-stone-100 cursor-pointer shadow-sm"
                  title="Refresh telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${healthFetching ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {!isAdmin ? (
              <div className="py-12 text-center text-xs text-stone-500 italic">
                Infrastructure diagnostics and queue depth telemetry are restricted to Administrator clearance.
              </div>
            ) : healthLoading ? (
              <div className="py-16 text-center text-xs text-stone-500 animate-pulse">
                [ SAMPLING TELEMETRY SENSORS... ]
              </div>
            ) : (
              <div className="space-y-6 text-xs">
                
                {/* 1. Redis Buffer Stream Stats */}
                <div className="p-4 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-black uppercase">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-[#bef264]" />
                      <span>REDIS STREAMS INGESTION BUFFER</span>
                    </span>
                    <span className="bg-[#16a34a] text-white text-[10px] px-2 py-0.5 rounded">
                      STATUS: {queue.status || 'ONLINE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Queue Length</div>
                      <div className="text-xl font-black text-black dark:text-white">{queue.queueLength ?? 0}</div>
                    </div>

                    <div className="p-2.5 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Pending in PEL</div>
                      <div className="text-xl font-black text-black dark:text-white">{queue.pendingCount ?? 0}</div>
                    </div>

                    <div className="p-2.5 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Dead Letter (DLQ)</div>
                      <div className="text-xl font-black text-[#ef4444]">{queue.dlqLength ?? 0}</div>
                    </div>

                    <div className="p-2.5 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded-lg">
                      <div className="text-[10px] text-stone-500 font-bold uppercase">Oldest In Queue</div>
                      <div className="text-xl font-black text-stone-700 dark:text-stone-300">{queue.oldestMessageAgeSeconds ?? 0}s</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-stone-500 border-t border-stone-200 dark:border-stone-800 pt-2 flex flex-wrap justify-between gap-2">
                    <div>Stream: <code className="font-bold text-black dark:text-white">{queue.streamName}</code></div>
                    <div>Consumer Group: <code className="font-bold text-black dark:text-white">{queue.consumerGroup}</code></div>
                  </div>
                </div>

                {/* 2. MongoDB Permanent Storage Stats */}
                <div className="p-4 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-black uppercase">
                    <span className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-[#bef264]" />
                      <span>MONGODB DURABLE STORAGE</span>
                    </span>
                    <span className="bg-[#16a34a] text-white text-[10px] px-2 py-0.5 rounded">
                      HEALTH: {database.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Host</div>
                      <div className="font-black truncate">{database.host}</div>
                    </div>
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Database</div>
                      <div className="font-black truncate">{database.dbName}</div>
                    </div>
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Connection State</div>
                      <div className="font-black text-[#16a34a]">Connected (ReadyState: {database.readyState})</div>
                    </div>
                  </div>
                </div>

                {/* 3. Node.js & Host Memory Telemetry */}
                <div className="p-4 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-black uppercase">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#bef264]" />
                      <span>HOST PROCESS ENGINE</span>
                    </span>
                    <span className="text-stone-500 text-[10px]">
                      UPTIME: {system.uptimeSeconds}s ({Math.floor(system.uptimeSeconds / 60)}m)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Heap Used</div>
                      <div className="font-black">{system.memoryUsage?.heapUsedMB} MB</div>
                    </div>
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Heap Total</div>
                      <div className="font-black">{system.memoryUsage?.heapTotalMB} MB</div>
                    </div>
                    <div className="p-2 bg-stone-50 dark:bg-[#121216] border border-black/20 rounded">
                      <div className="text-[10px] text-stone-500 font-bold">Process RSS</div>
                      <div className="font-black">{system.memoryUsage?.rssMB} MB</div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
