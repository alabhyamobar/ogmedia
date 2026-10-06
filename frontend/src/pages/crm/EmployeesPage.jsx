import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  UserPlus,
  KeyRound,
  Shield,
  Copy,
  Check,
  AlertCircle,
  Wand2,
  RefreshCw,
  Eye,
  EyeOff,
  Search,
  Lock,
  Sparkles
} from 'lucide-react';

const ALL_SERVICES = [
  'META_ADS',
  'GOOGLE_ADS',
  'SEO',
  'WEB_DEVELOPMENT',
  'SOCIAL_MEDIA',
  'CONTENT_MARKETING',
  'GRAPHIC_DESIGN',
  'GENERAL'
];

function generateClientPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { isAdmin, isDeveloper, canManage, user: currentUser } = useAuth();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, employee: null });
  const [credentialsModal, setCredentialsModal] = useState({
    open: false,
    employee: null,
    temporaryPassword: '',
    title: 'AGENT CREDENTIALS ISSUED'
  });

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPasswordInModal, setShowPasswordInModal] = useState(true);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [isGeneratingUsername, setIsGeneratingUsername] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    email: '',
    role: 'EMPLOYEE',
    expertise: ['META_ADS'],
    temporaryPassword: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    expertise: [],
    status: 'ACTIVE'
  });

  const { data, isLoading } = useQuery({
    queryKey: ['employees-management-list'],
    queryFn: () => api.getEmployees({ limit: 100 })
  });

  const employees = data?.data?.employees || [];

  const createMutation = useMutation({
    mutationFn: (empData) => api.createEmployee(empData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees-management-list']);
      setCreateModalOpen(false);
      setCredentialsModal({
        open: true,
        employee: res.data?.employee,
        temporaryPassword: res.data?.temporaryPassword,
        title: 'AGENT RECRUITED & CREDENTIALS ISSUED'
      });
      setNewEmployee({
        name: '',
        username: '',
        email: '',
        role: 'EMPLOYEE',
        expertise: ['META_ADS'],
        temporaryPassword: ''
      });
      setActionError(null);
      setActionSuccess(`Agent @${res.data?.employee?.username} enrolled successfully with role ${res.data?.employee?.role}.`);
      setTimeout(() => setActionSuccess(null), 5000);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to create employee account');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.updateEmployee(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['employees-management-list']);
      setEditModal({ open: false, employee: null });
      setActionError(null);
      setActionSuccess(`Agent @${res.data?.employee?.username} clearance updated.`);
      setTimeout(() => setActionSuccess(null), 5000);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to update employee clearance');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.updateEmployee(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['employees-management-list']);
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to update employee status');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id) => api.resetEmployeePassword(id),
    onSuccess: (res, id) => {
      const emp = employees.find((e) => e._id === id) || res.data?.employee;
      setCredentialsModal({
        open: true,
        employee: {
          ...emp,
          username: emp?.username || res.data?.employee?.username,
          role: emp?.role === 'SUPER_ADMIN' ? 'ADMIN' : emp?.role || res.data?.employee?.role
        },
        temporaryPassword: res.data?.temporaryPassword,
        title: 'TEMPORARY SECURITY KEY REGENERATED'
      });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to regenerate employee security key');
    }
  });

  const handleGenerateUsername = async () => {
    try {
      setIsGeneratingUsername(true);
      const res = await api.suggestUsername(newEmployee.name, newEmployee.email);
      if (res?.data?.username) {
        setNewEmployee((prev) => ({ ...prev, username: res.data.username }));
      }
    } catch {
      const fallback = (newEmployee.name || 'agent')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '');
      setNewEmployee((prev) => ({
        ...prev,
        username: (fallback || 'agent') + Math.floor(100 + Math.random() * 900)
      }));
    } finally {
      setIsGeneratingUsername(false);
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateClientPassword(12);
    setNewEmployee((prev) => ({ ...prev, temporaryPassword: generated }));
    setShowPasswordInForm(true);
  };

  const handleCopySingleKey = () => {
    navigator.clipboard.writeText(credentialsModal.temporaryPassword);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCopyAllCredentials = () => {
    const loginUrl = `${window.location.origin}/crm/login`;
    const roleName = credentialsModal.employee?.role === 'SUPER_ADMIN' ? 'ADMIN' : credentialsModal.employee?.role || 'EMPLOYEE';
    const text = [
      '==================================================',
      '        OG MEDIA CRM - AGENT ACCESS DOSSIER       ',
      '==================================================',
      `Agent Name:   ${credentialsModal.employee?.name || 'N/A'}`,
      `Username:     ${credentialsModal.employee?.username || 'N/A'}`,
      `Assigned Role:${roleName}`,
      `Temporary Key:${credentialsModal.temporaryPassword}`,
      `Portal Login: ${loginUrl}`,
      '--------------------------------------------------',
      'SECURITY DIRECTIVE: You are required to update this',
      'temporary security key immediately upon first login.',
      '=================================================='
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const openEditModal = (emp) => {
    setEditForm({
      name: emp.name,
      email: emp.email,
      role: emp.role === 'SUPER_ADMIN' ? 'ADMIN' : emp.role,
      expertise: emp.expertise || [],
      status: emp.status
    });
    setEditModal({ open: true, employee: emp });
  };

  const toggleCreateExpertise = (srv) => {
    setNewEmployee((prev) => {
      const exists = prev.expertise.includes(srv);
      return {
        ...prev,
        expertise: exists
          ? prev.expertise.filter((s) => s !== srv)
          : [...prev.expertise, srv]
      };
    });
  };

  const toggleEditExpertise = (srv) => {
    setEditForm((prev) => {
      const exists = prev.expertise.includes(srv);
      return {
        ...prev,
        expertise: exists
          ? prev.expertise.filter((s) => s !== srv)
          : [...prev.expertise, srv]
      };
    });
  };

  const filteredEmployees = employees.filter((emp) => {
    const normalizedRole = emp.role === 'SUPER_ADMIN' ? 'ADMIN' : emp.role;
    const matchesRole = roleFilter === 'ALL' || normalizedRole === roleFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.username?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const countByRole = {
    ALL: employees.length,
    ADMIN: employees.filter((e) => e.role === 'ADMIN' || e.role === 'SUPER_ADMIN').length,
    EMPLOYEE: employees.filter((e) => e.role === 'EMPLOYEE').length
  };

  return (
    <div className="space-y-6 sm:space-y-8 select-none font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono-tech text-xs font-bold text-stone-500 flex items-center gap-1.5">
            <span>/// 04 PERSONNEL PROTOCOL</span>
            {canManage && (
              <span className="bg-[#39FF14] text-black font-black text-[9px] px-1.5 py-0.2 rounded border border-black">
                {isDeveloper ? '⚡ DEVELOPER ROOT CLEARANCE' : 'ADMIN AUTHORIZED'}
              </span>
            )}
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
            Team Roster & Security Clearance
          </h1>
          <p className="font-mono-tech text-xs text-stone-600 dark:text-stone-400">
            Generate employee credentials, assign administrative clearance, and configure domain expertise isolation.
          </p>
        </div>

        {canManage ? (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-mono-tech font-black text-xs px-4 py-2.5 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer uppercase"
          >
            <UserPlus className="w-4 h-4" />
            <span>RECRUIT AGENT</span>
          </button>
        ) : (
          <div className="px-3 py-2 bg-stone-100 dark:bg-[#1a1a20] border-2 border-dashed border-stone-400 rounded-xl font-mono-tech text-[11px] text-stone-500 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            <span>RECRUITMENT RESTRICTED TO ADMIN</span>
          </div>
        )}
      </div>

      {actionError && (
        <div className="p-3.5 bg-[#ef4444]/15 border-2 border-[#ef4444] rounded-xl flex items-start gap-2.5 text-[#ef4444] font-mono-tech text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-bold">{actionError}</div>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 bg-[#39FF14]/25 border-2 border-[#16a34a] rounded-xl flex items-start gap-2.5 text-black dark:text-white font-mono-tech text-xs animate-fade-in">
          <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#16a34a]" />
          <div className="font-bold">{actionSuccess}</div>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 font-mono-tech text-xs">
          {[
            { id: 'ALL', label: 'ALL AGENTS', count: countByRole.ALL },
            { id: 'ADMIN', label: '⚡ ADMIN', count: countByRole.ADMIN },
            { id: 'EMPLOYEE', label: '👤 EMPLOYEE', count: countByRole.EMPLOYEE }
          ].map((tab) => {
            const active = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 border-2 border-black rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  active
                    ? 'bg-black text-[#39FF14] shadow-[2px_2px_0px_#39FF14]'
                    : 'bg-white dark:bg-[#1a1a20] text-stone-700 dark:text-stone-300 hover:bg-stone-100 shadow-[2px_2px_0px_#000]'
                }`}
              >
                {tab.label} <span className="opacity-75">({tab.count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by name, username, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-lg text-xs font-mono-tech outline-none focus:ring-2 focus:ring-[#39FF14]"
          />
        </div>
      </div>

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl shadow-[6px_6px_0px_#000] overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center font-mono-tech text-xs text-stone-500 animate-pulse">
            [ QUERYING ACTIVE AGENT ROSTER... ]
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center font-mono-tech text-xs text-stone-500">
            [ NO AGENTS FOUND MATCHING CRITERIA ]
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-tech text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-[#1a1a20] border-b-2 border-black dark:border-stone-700 text-stone-600 dark:text-stone-400 uppercase text-[10px]">
                  <th className="py-3 px-4 font-black">Agent / Username</th>
                  <th className="py-3 px-4 font-black">Security Role</th>
                  <th className="py-3 px-4 font-black">Authorized Sectors (Isolation)</th>
                  <th className="py-3 px-4 font-black">Account Status</th>
                  <th className="py-3 px-4 font-black">Performance</th>
                  <th className="py-3 px-4 font-black text-right">Clearance Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-stone-800">
                {filteredEmployees.map((emp) => {
                  const isCurrent = currentUser?.id === emp._id;
                  const isAdminRole = emp.role === 'ADMIN' || emp.role === 'SUPER_ADMIN';
                  return (
                    <tr
                      key={emp._id}
                      className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-black text-black dark:text-white flex items-center gap-1.5">
                          <span>{emp.name}</span>
                          {isCurrent && (
                            <span className="text-[9px] bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 px-1 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          @{emp.username} • {emp.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdminRole ? (
                          <span className="bg-[#39FF14] text-black font-black text-[10px] px-2.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000] inline-flex items-center gap-1">
                            ⚡ ADMIN
                          </span>
                        ) : (
                          <span className="bg-stone-200 dark:bg-[#252530] text-stone-800 dark:text-stone-200 font-bold text-[10px] px-2.5 py-0.5 rounded border border-black/30 dark:border-stone-700 inline-flex items-center gap-1">
                            👤 EMPLOYEE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdminRole ? (
                          <span className="bg-black text-[#39FF14] font-extrabold text-[10px] px-2 py-0.5 rounded border border-black">
                            ★ GLOBAL ACCESS
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(emp.expertise || []).length > 0 ? (
                              emp.expertise.map((srv) => (
                                <span
                                  key={srv}
                                  className="bg-white dark:bg-[#1e1e24] text-stone-800 dark:text-stone-200 border border-black/30 dark:border-stone-700 font-bold text-[9px] px-1.5 py-0.2 rounded"
                                >
                                  {srv.replace('_', ' ')}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-stone-400 italic">No sectors assigned</span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded border ${
                            emp.status === 'ACTIVE'
                              ? 'bg-[#16a34a] text-white border-black'
                              : 'bg-[#ef4444] text-white border-black'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400 text-[11px]">
                        {emp.stats ? `${emp.stats.converted} won / ${emp.stats.totalAssigned} assigned` : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {canManage && (
                          <>
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-1.5 bg-white dark:bg-[#1a1a20] hover:bg-[#39FF14] hover:text-black border-2 border-black dark:border-stone-700 rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer transition-colors"
                              title="Edit Role & Clearances"
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => resetPasswordMutation.mutate(emp._id)}
                              className="p-1.5 bg-white dark:bg-[#1a1a20] hover:bg-stone-100 dark:hover:bg-stone-800 border-2 border-black dark:border-stone-700 rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer"
                              title="Regenerate temporary password"
                            >
                              <KeyRound className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
                            </button>

                            <button
                              onClick={() =>
                                toggleStatusMutation.mutate({
                                  id: emp._id,
                                  status: emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                })
                              }
                              className={`px-2.5 py-1 text-[10px] font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
                                emp.status === 'ACTIVE'
                                  ? 'bg-white dark:bg-[#1a1a20] hover:bg-[#ef4444] hover:text-white text-stone-800 dark:text-stone-200'
                                  : 'bg-[#16a34a] text-white'
                              }`}
                            >
                              {emp.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-6 max-w-xl w-full shadow-[8px_8px_0px_#000] space-y-4 font-mono-tech animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
              <span className="font-black text-xs uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#39FF14]" />
                <span>ONBOARD PERSONNEL & GENERATE CREDENTIALS</span>
              </span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-stone-400 hover:text-black dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newEmployee);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setNewEmployee((prev) => ({
                      ...prev,
                      name
                    }));
                  }}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#39FF14]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">
                    Username
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateUsername}
                    disabled={isGeneratingUsername}
                    className="text-[10px] font-bold text-black dark:text-[#39FF14] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3 text-[#39FF14]" />
                    <span>{isGeneratingUsername ? 'GENERATING...' : 'GENERATE USERNAME'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={newEmployee.username}
                    onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value.toLowerCase() })}
                    placeholder="Leave blank to auto-generate or click Generate"
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#39FF14]"
                  />
                </div>
                <div className="mt-1 text-[9px] text-stone-500">
                  Tip: Auto-generated uniquely from name/email if left blank.
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="maya@ogmedia.agency"
                  className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#39FF14]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-2">
                  Assign Security Clearance Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => setNewEmployee({ ...newEmployee, role: 'EMPLOYEE' })}
                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      newEmployee.role === 'EMPLOYEE'
                        ? 'border-black bg-stone-100 dark:bg-[#252530] shadow-[3px_3px_0px_#000]'
                        : 'border-black/30 dark:border-stone-700 bg-white dark:bg-[#1e1e24] opacity-80'
                    }`}
                  >
                    <div className="font-black text-xs text-black dark:text-white flex items-center justify-between">
                      <span>👤 EMPLOYEE</span>
                      {newEmployee.role === 'EMPLOYEE' && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Domain Specialist. Access strictly limited to authorized sectors.
                    </div>
                  </div>

                  <div
                    onClick={() => setNewEmployee({ ...newEmployee, role: 'ADMIN' })}
                    className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      newEmployee.role === 'ADMIN'
                        ? 'border-black bg-[#39FF14]/25 dark:bg-[#39FF14]/20 shadow-[3px_3px_0px_#39FF14]'
                        : 'border-black/30 dark:border-stone-700 bg-white dark:bg-[#1e1e24] opacity-80'
                    }`}
                  >
                    <div className="font-black text-xs text-black dark:text-[#39FF14] flex items-center justify-between">
                      <span>⚡ ADMIN</span>
                      {newEmployee.role === 'ADMIN' && <Check className="w-3.5 h-3.5 text-[#16a34a]" />}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1 leading-snug">
                      Administrator. Full operational authority, personnel enrollment, and global access.
                    </div>
                  </div>
                </div>
              </div>

              {newEmployee.role === 'EMPLOYEE' ? (
                <div className="p-3 bg-stone-50 dark:bg-[#181820] border-2 border-black/40 dark:border-stone-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase">
                      Authorized Sectors (Select Permitted Domains) *
                    </label>
                    <span className="text-[9px] text-stone-500 font-bold">
                      {newEmployee.expertise.length} Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_SERVICES.map((srv) => {
                      const isSelected = newEmployee.expertise.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleCreateExpertise(srv)}
                          className={`p-2 border rounded-lg text-[10px] font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-black text-[#39FF14] border-black shadow-[2px_2px_0px_#39FF14]'
                              : 'bg-white dark:bg-[#1e1e24] text-stone-700 dark:text-stone-300 border-black/30'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {srv.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#39FF14]/15 border border-black dark:border-[#39FF14]/30 rounded-xl text-[10px] text-stone-800 dark:text-stone-200 font-mono-tech flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Administrators automatically possess global clearance across all sectors.</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase">
                    Temporary Security Key
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] font-bold text-black dark:text-[#39FF14] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-[#39FF14]" />
                    <span>GENERATE SECURE KEY</span>
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPasswordInForm ? 'text' : 'password'}
                    value={newEmployee.temporaryPassword}
                    onChange={(e) => setNewEmployee({ ...newEmployee, temporaryPassword: e.target.value })}
                    placeholder="Leave blank to auto-generate random 12-char key"
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#39FF14] font-mono-tech"
                  />
                  {newEmployee.temporaryPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                      className="absolute right-3 text-stone-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      {showPasswordInForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border-2 border-black dark:border-stone-700 rounded-lg text-xs font-bold cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs cursor-pointer flex items-center gap-1.5"
                >
                  {createMutation.isPending ? 'DEPLOYING...' : 'ENROLL AGENT & ISSUE CREDENTIALS →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal.open && editModal.employee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-6 max-w-lg w-full shadow-[8px_8px_0px_#000] space-y-4 font-mono-tech animate-fade-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
              <span className="font-black text-xs uppercase flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#39FF14]" />
                <span>EDIT CLEARANCE & ASSIGN ROLE: @{editModal.employee.username}</span>
              </span>
              <button
                onClick={() => setEditModal({ open: false, employee: null })}
                className="text-stone-400 hover:text-black dark:hover:text-white cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({
                  id: editModal.employee._id,
                  data: editForm
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1.5">
                  Security Clearance Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['EMPLOYEE', 'ADMIN'].map((r) => {
                    const isSelected = editForm.role === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, role: r })}
                        className={`p-2.5 border-2 rounded-xl text-[10px] font-black text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#39FF14] text-black border-black shadow-[2px_2px_0px_#000]'
                            : 'bg-white dark:bg-[#1e1e24] text-stone-700 dark:text-stone-300 border-black/30'
                        }`}
                      >
                        {r === 'ADMIN' ? '⚡ ADMIN' : '👤 EMPLOYEE'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {editForm.role === 'EMPLOYEE' ? (
                <div className="p-3 bg-stone-50 dark:bg-[#181820] border-2 border-black/40 dark:border-stone-700 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-stone-700 dark:text-stone-300 uppercase">
                      Sector Isolation Clearance
                    </label>
                    <span className="text-[9px] text-stone-500 font-bold">
                      {editForm.expertise.length} Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ALL_SERVICES.map((srv) => {
                      const isSelected = editForm.expertise.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => toggleEditExpertise(srv)}
                          className={`p-2 border rounded-lg text-[10px] font-bold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-black text-[#39FF14] border-black shadow-[2px_2px_0px_#39FF14]'
                              : 'bg-white dark:bg-[#1e1e24] text-stone-700 dark:text-stone-300 border-black/30'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {srv.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-[#39FF14]/15 border border-black dark:border-[#39FF14]/30 rounded-xl text-[10px] text-stone-800 dark:text-stone-200 font-mono-tech flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#39FF14] shrink-0" />
                  <span>Global sector authorization is automatically active for Administrators.</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                  Account Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'ACTIVE' })}
                    className={`py-2 border-2 rounded-xl text-xs font-bold cursor-pointer ${
                      editForm.status === 'ACTIVE'
                        ? 'bg-[#16a34a] text-white border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white dark:bg-[#1e1e24] text-stone-600 border-black/30'
                    }`}
                  >
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, status: 'INACTIVE' })}
                    className={`py-2 border-2 rounded-xl text-xs font-bold cursor-pointer ${
                      editForm.status === 'INACTIVE'
                        ? 'bg-[#ef4444] text-white border-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white dark:bg-[#1e1e24] text-stone-600 border-black/30'
                    }`}
                  >
                    DEACTIVATED
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, employee: null })}
                  className="px-4 py-2 border-2 border-black dark:border-stone-700 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs cursor-pointer"
                >
                  {updateMutation.isPending ? 'SAVING...' : 'COMMIT ROLE & CLEARANCE →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {credentialsModal.open && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[3px] border-black dark:border-stone-700 rounded-2xl p-6 max-w-md w-full shadow-[10px_10px_0px_#39FF14] space-y-4 font-mono-tech animate-fade-in text-center">
            <div className="inline-block bg-[#39FF14] text-black text-[11px] font-black px-3 py-1 border border-black rounded shadow-[2px_2px_0px_#000]">
              {credentialsModal.title}
            </div>

            <h3 className="font-heading text-2xl font-black text-black dark:text-white uppercase">
              Agent Security Dossier
            </h3>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              Provide these access credentials to agent{' '}
              <span className="font-black text-black dark:text-white">
                @{credentialsModal.employee?.username}
              </span>
              . Temporary key will be required to change on first login.
            </p>

            <div className="bg-black text-stone-100 border-2 border-black rounded-xl p-4 text-left space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Assigned Clearance:</span>
                <span className="bg-[#39FF14] text-black font-black text-[10px] px-2 py-0.5 rounded">
                  {credentialsModal.employee?.role === 'SUPER_ADMIN' ? 'ADMIN' : credentialsModal.employee?.role || 'EMPLOYEE'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-bold">Username</div>
                  <div className="font-mono-tech font-bold text-white text-sm">
                    {credentialsModal.employee?.username}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(credentialsModal.employee?.username || '');
                  }}
                  className="p-1.5 text-stone-400 hover:text-[#39FF14] cursor-pointer"
                  title="Copy username"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-bold">Temporary Key</div>
                  <div className="font-mono-tech font-black text-[#39FF14] text-base tracking-wider">
                    {showPasswordInModal ? credentialsModal.temporaryPassword : '••••••••••••'}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="p-1.5 text-stone-400 hover:text-white cursor-pointer"
                    title={showPasswordInModal ? 'Hide' : 'Reveal'}
                  >
                    {showPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySingleKey}
                    className="p-1.5 text-stone-400 hover:text-[#39FF14] cursor-pointer"
                    title="Copy key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-[#39FF14]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCopyAllCredentials}
                className="w-full py-2.5 px-4 bg-white dark:bg-[#1a1a20] hover:bg-stone-100 dark:hover:bg-stone-800 text-black dark:text-white font-black border-2 border-black dark:border-stone-700 rounded-xl shadow-[3px_3px_0px_#000] text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4 text-[#16a34a]" />
                    <span>COPIED DOSSIER TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#39FF14]" />
                    <span>COPY FORMATTED HANDOVER DOSSIER</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCredentialsModal({ open: false, employee: null, temporaryPassword: '', title: '' })}
                className="w-full bg-[#39FF14] hover:bg-[#7CFF5E] text-black font-black py-2.5 px-4 border-2 border-black rounded-xl shadow-[3px_3px_0px_#000] text-xs cursor-pointer"
              >
                DISMISS CREDENTIAL DIALOG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
