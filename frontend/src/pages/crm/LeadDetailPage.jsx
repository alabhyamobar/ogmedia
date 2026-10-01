import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Send,
  UserCheck,
  AlertCircle,
  Activity
} from 'lucide-react';

const STATUS_ORDER = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'CONVERTED'
];

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, isDeveloper } = useAuth();

  const [noteText, setNoteText] = useState('');
  const [statusModal, setStatusModal] = useState({ open: false, targetStatus: null, note: '' });
  const [assigneeId, setAssigneeId] = useState('');
  const [actionError, setActionError] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['lead-detail', id],
    queryFn: () => api.getLeadById(id)
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-for-assign'],
    queryFn: () => api.getEmployees({ limit: 100 }),
    enabled: isAdmin || isDeveloper
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }) => api.updateLeadStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['lead-detail', id]);
      queryClient.invalidateQueries(['leads-list']);
      queryClient.invalidateQueries(['analytics-overview']);
      setStatusModal({ open: false, targetStatus: null, note: '' });
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to update status');
    }
  });

  const noteMutation = useMutation({
    mutationFn: (text) => api.addLeadNote(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries(['lead-detail', id]);
      setNoteText('');
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err.message || 'Failed to add note');
    }
  });

  const assignMutation = useMutation({
    mutationFn: (empId) => api.assignLead(id, empId || null),
    onSuccess: () => {
      queryClient.invalidateQueries(['lead-detail', id]);
      queryClient.invalidateQueries(['leads-list']);
      setActionError(null);
    },
    onError: (err) => {
      setActionError(err.message || 'Assignment failed');
    }
  });

  if (isLoading) {
    return (
      <div className="py-24 text-center font-mono-tech text-xs text-stone-500 animate-pulse">
        [ RETRIEVING DOSSIER SPECIFICATIONS... ]
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white dark:bg-[#16161a] border-2 border-black dark:border-stone-700 rounded-2xl p-8 shadow-[6px_6px_0px_#ef4444] text-center space-y-4 font-mono-tech">
        <div className="bg-[#ef4444] text-white text-xs font-black px-3 py-1 inline-block border border-black">
          ACCESS RESTRICTED // 403
        </div>
        <h2 className="font-heading text-2xl font-black text-black dark:text-white uppercase">
          Transmission Restricted
        </h2>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          {error.message || 'You are not authorized to view leads outside your assigned expertise sectors.'}
        </p>
        <Link
          to="/crm/leads"
          className="inline-block bg-black text-[#bef264] px-4 py-2 text-xs font-black border border-black rounded shadow-[2px_2px_0px_#bef264]"
        >
          ← Return to Leads
        </Link>
      </div>
    );
  }

  const lead = data?.data?.lead;
  if (!lead) return null;

  const currentStatusIdx = STATUS_ORDER.indexOf(lead.status);

  return (
    <div className="max-w-6xl mx-auto space-y-6 select-none font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/crm/leads"
            className="p-2 bg-white dark:bg-[#1a1a20] border-2 border-black dark:border-stone-700 rounded-xl shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-black dark:text-white" />
          </Link>
          <div>
            <div className="font-mono-tech text-[10px] font-bold text-stone-500 uppercase">
              TRANSMISSION DOSSIER // {lead.eventId?.substring(0, 8)}
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
              {lead.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-tech text-xs text-stone-500 font-bold uppercase">
            STATUS:
          </span>
          <span
            className={`font-mono-tech text-xs font-black px-3 py-1 rounded-lg border-2 border-black shadow-[3px_3px_0px_#000] ${
              lead.status === 'CONVERTED'
                ? 'bg-[#16a34a] text-white'
                : lead.status === 'NEW'
                ? 'bg-[#ef4444] text-white animate-pulse'
                : lead.status === 'LOST'
                ? 'bg-stone-300 text-stone-800'
                : 'bg-[#bef264] text-black'
            }`}
          >
            {lead.status}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-[#ef4444]/15 border-2 border-[#ef4444] rounded-xl flex items-start gap-2.5 text-[#ef4444] font-mono-tech text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="font-bold">{actionError}</div>
        </div>
      )}

      <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-4 sm:p-6 shadow-[5px_5px_0px_#000]">
        <div className="font-mono-tech text-[10px] font-bold text-stone-500 uppercase mb-3">
          // PIPELINE PROGRESSION STAGE
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono-tech text-[10px]">
          {STATUS_ORDER.map((st, idx) => {
            const isCompleted = currentStatusIdx >= idx && lead.status !== 'LOST';
            const isCurrent = lead.status === st;

            return (
              <button
                key={st}
                onClick={() => setStatusModal({ open: true, targetStatus: st, note: '' })}
                className={`p-2.5 border-2 rounded-xl text-center font-black transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-[#bef264] border-black shadow-[3px_3px_0px_#bef264] -translate-y-0.5'
                    : isCompleted
                    ? 'bg-[#bef264] text-black border-black shadow-sm'
                    : 'bg-white dark:bg-[#1e1e24] text-stone-600 dark:text-stone-400 border-black/30 dark:border-stone-800 hover:border-black'
                }`}
              >
                <div>{idx + 1}. {st}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-end font-mono-tech text-xs">
          {lead.status !== 'LOST' ? (
            <button
              onClick={() => setStatusModal({ open: true, targetStatus: 'LOST', note: '' })}
              className="text-[#ef4444] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark as Lost Deal</span>
            </button>
          ) : (
            <button
              onClick={() => setStatusModal({ open: true, targetStatus: 'NEW', note: 'Reopened by agent' })}
              className="text-[#16a34a] font-bold hover:underline cursor-pointer"
            >
              ✓ Re-open Transmission
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3 font-mono-tech">
              <span className="font-bold text-xs text-stone-500 uppercase">// CUSTOMER SPECIFICATIONS</span>
              <span className="bg-black text-[#bef264] font-black text-[10px] px-2 py-0.5 rounded">
                SECTOR: {lead.service}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
              
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Email Address</div>
                  <a href={`mailto:${lead.email}`} className="font-black text-black dark:text-white hover:text-[#bef264]">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Phone Number</div>
                  <div className="font-black text-black dark:text-white">
                    {lead.phone || 'Not provided'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Company / Studio</div>
                  <div className="font-black text-black dark:text-white">
                    {lead.company || 'Direct Individual'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-stone-500 uppercase font-bold">Transmission Ingested</div>
                  <div className="font-black text-black dark:text-white">
                    {new Date(lead.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-tech text-xs">
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold">Current Assigned Agent: </span>
                <span className="font-black text-black dark:text-white">
                  {lead.assignedTo ? `${lead.assignedTo.name} (${lead.assignedTo.username})` : 'Unassigned'}
                </span>
              </div>

              {(isAdmin || isDeveloper) && (
                <div className="flex items-center gap-2">
                  <select
                    value={assigneeId || lead.assignedTo?._id || ''}
                    onChange={(e) => {
                      setAssigneeId(e.target.value);
                      assignMutation.mutate(e.target.value);
                    }}
                    className="px-2.5 py-1.5 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-lg font-mono-tech text-xs text-black dark:text-white outline-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {(employeesData?.data?.employees || [])
                      .filter((e) => isDeveloper || e.role === 'ADMIN' || e.role === 'SUPER_ADMIN' || (e.expertise && e.expertise.includes(lead.service)))
                      .map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name} ({emp.expertise?.join(', ') || 'Global'})
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-3">
            <div className="font-mono-tech text-[10px] font-bold text-stone-500 uppercase">
              // ORIGINAL TRANSMISSION MESSAGE
            </div>
            <div className="p-4 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs sm:text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed shadow-inner">
              {lead.message}
            </div>
          </div>

        </div>

        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-4 font-mono-tech">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
              <span className="font-black text-xs text-black dark:text-white uppercase flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>Internal Agent Notes ({lead.notes?.length || 0})</span>
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (noteText.trim()) noteMutation.mutate(noteText.trim());
              }}
              className="space-y-2"
            >
              <textarea
                rows="3"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log call summary, client budget, timeline notes..."
                className="w-full p-2.5 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl font-mono-tech text-xs text-black dark:text-white placeholder-stone-400 outline-none focus:ring-2 focus:ring-[#bef264]"
              />
              <button
                type="submit"
                disabled={!noteText.trim() || noteMutation.isPending}
                className="w-full bg-[#bef264] hover:bg-[#a3e635] text-black font-black text-xs py-2 px-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>POST INTERNAL NOTE</span>
              </button>
            </form>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {(lead.notes || []).length === 0 ? (
                <div className="text-center py-6 text-stone-400 text-xs italic">
                  No internal notes recorded yet.
                </div>
              ) : (
                lead.notes
                  .slice()
                  .reverse()
                  .map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-[#1e1e24] border border-black/30 dark:border-stone-700 rounded-xl space-y-1 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-black dark:text-white font-black">
                          {note.authorName}
                        </span>
                        <span className="text-stone-400">
                          {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                        {note.text}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-5 shadow-[5px_5px_0px_#000] space-y-3 font-mono-tech">
            <div className="flex items-center gap-1.5 font-black text-xs text-black dark:text-white uppercase border-b-2 border-black dark:border-stone-700 pb-2">
              <Activity className="w-4 h-4 text-[#bef264]" />
              <span>Immutable Audit Timeline</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {(lead.timeline || []).map((tl, i) => (
                <div key={i} className="flex items-start gap-2 border-l-2 border-black dark:border-stone-700 pl-3 py-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-black dark:text-white">{tl.event}</span>
                      <span className="text-stone-400">
                        {new Date(tl.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 dark:text-stone-400">
                      {tl.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {statusModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] dark:bg-[#16161a] border-[2.5px] border-black dark:border-stone-700 rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#000] space-y-4 font-mono-tech animate-fade-in">
            <div className="flex items-center justify-between border-b-2 border-black dark:border-stone-700 pb-3">
              <span className="font-black text-xs uppercase">CONFIRM STAGE TRANSITION</span>
              <button
                onClick={() => setStatusModal({ open: false, targetStatus: null, note: '' })}
                className="text-stone-400 hover:text-black dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-stone-600 dark:text-stone-400">
                Move lead <span className="font-black text-black dark:text-white">{lead.name}</span> to:
              </div>
              <div className="text-lg font-black bg-[#bef264] text-black px-2 py-1 inline-block border border-black rounded">
                STAGE: {statusModal.targetStatus}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-400 uppercase mb-1">
                Optional Transition Note / Follow-up Summary:
              </label>
              <textarea
                rows="3"
                value={statusModal.note}
                onChange={(e) => setStatusModal({ ...statusModal, note: e.target.value })}
                placeholder="e.g. Budget agreed on call, sent contract proposal..."
                className="w-full p-2.5 bg-white dark:bg-[#1e1e24] border-2 border-black dark:border-stone-700 rounded-xl text-xs text-black dark:text-white outline-none focus:ring-2 focus:ring-[#bef264]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setStatusModal({ open: false, targetStatus: null, note: '' })}
                className="px-4 py-2 border-2 border-black dark:border-stone-700 rounded-lg text-xs font-bold bg-white dark:bg-[#1e1e24] cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  statusMutation.mutate({
                    status: statusModal.targetStatus,
                    note: statusModal.note.trim() || undefined
                  })
                }
                disabled={statusMutation.isPending}
                className="px-4 py-2 bg-[#bef264] hover:bg-[#a3e635] text-black font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] text-xs cursor-pointer"
              >
                {statusMutation.isPending ? 'UPDATING...' : 'CONFIRM TRANSITION →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
