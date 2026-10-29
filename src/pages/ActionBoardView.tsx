import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { ActionItem, AlertItem } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  User,
  Quote,
  CheckSquare,
  Check
} from 'lucide-react';

export const ActionBoardView: React.FC = () => {
  const { can, showToast, refreshState, setActiveView } = useApp();
  const [actions, setActions] = useState<ActionItem[]>(() => api.getActions());
  const [alerts, setAlerts] = useState<AlertItem[]>(() => api.getAlerts());
  const [expandedId, setExpandedId] = useState<string | null>('act_1');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Approval modal state
  const [activeModalAction, setActiveModalAction] = useState<ActionItem | null>(null);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [noteText, setNoteText] = useState('');

  const reload = () => {
    setActions(api.getActions(filterStatus));
    setAlerts(api.getAlerts());
    refreshState();
  };

  const handleAckAlert = (alertId: string) => {
    api.ackAlert(alertId);
    showToast('Critical alert acknowledged and logged to audit trail.', 'success');
    reload();
  };

  const openActionModal = (action: ActionItem, type: 'approve' | 'reject') => {
    setActiveModalAction(action);
    setModalType(type);
    setNoteText(type === 'approve' ? 'Approved for execution by kitchen shift.' : '');
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalAction) return;

    if (modalType === 'approve') {
      const { createdTask } = api.approveAction(activeModalAction.id, noteText);
      showToast(`Action #${activeModalAction.rank} approved! Dispatched Task: "${createdTask.title}"`, 'success');
    } else {
      api.rejectAction(activeModalAction.id, noteText);
      showToast(`Action #${activeModalAction.rank} rejected.`, 'info');
    }

    setActiveModalAction(null);
    reload();
  };

  const handleBulkApprove = () => {
    const res = api.bulkApproveTop3();
    showToast(`Bulk approved top ${res.approvedCount} ranked actions and generated kitchen tasks!`, 'success');
    reload();
  };

  const unackedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Action Board Guide:</span> The multi-agent pipeline ranks operational actions by composite risk score (Severity × Frequency × Health Risk Multiplier). Approving an action pauses the graph, logs to audit, and automatically creates a dispatch task for the assigned Cook or Lead.
        </div>
      </div>

      {/* Red Critical Alerts Banner at Top */}
      {can('alerts.receive') && unackedAlerts.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-600 text-white animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wide">
                  Critical Kitchen & Health Alerts ({unackedAlerts.length} Unacknowledged)
                </h3>
                <p className="text-xs text-rose-700">Immediate supervisor acknowledgment required under HACCP compliance.</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-rose-200/80">
            {unackedAlerts.map(alt => (
              <div key={alt.id} className="pt-3 pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-900">{alt.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-bold">
                      Match: "{alt.keywordMatch}"
                    </span>
                  </div>
                  <div className="text-xs text-rose-700 mt-0.5">{alt.description}</div>
                </div>

                <button
                  onClick={() => handleAckAlert(alt.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-auto shrink-0"
                >
                  Acknowledge Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Controls & Bulk Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Synthesized Action Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">Prioritized recommendations generated from diner feedback and safety logs</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => {
              setFilterStatus(e.target.value);
              setActions(api.getActions(e.target.value));
            }}
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 hover:border-slate-300 transition cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>

          {can('action.approve') && (
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bulk Approve Top 3</span>
            </button>
          )}
        </div>
      </div>

      {/* Ranked Action Cards List */}
      <div className="space-y-4">
        {actions.map(action => {
          const isExpanded = expandedId === action.id;

          let riskBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
          if (action.riskLevel === 'High') {
            riskBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
          } else if (action.riskLevel === 'Medium') {
            riskBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
          } else if (action.riskLevel === 'Low') {
            riskBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
          }

          return (
            <div
              key={action.id}
              className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                action.status === 'approved'
                  ? 'border-emerald-200 ring-1 ring-emerald-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header Row */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Rank Number Badge */}
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-mono font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                      #{action.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${riskBadgeClass}`}>
                          {action.riskLevel} Risk
                        </span>
                        <span className="text-xs text-slate-500">
                          Composite Score: <strong className="font-mono text-slate-900">{action.score.toFixed(1)}</strong>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Owner: <strong className="text-slate-700">{action.ownerRole}</strong></span>
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: <strong className="text-slate-700">{action.dueDate}</strong></span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-2 tracking-tight">
                        {action.issue}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        <strong className="text-slate-800">Recommendation:</strong> {action.recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Status & Action Buttons */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {action.status === 'pending' ? (
                      can('action.approve') ? (
                        <>
                          <button
                            onClick={() => openActionModal(action, 'approve')}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openActionModal(action, 'reject')}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          Pending Approval (Manager Only)
                        </span>
                      )
                    ) : action.status === 'approved' ? (
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                        <button
                          onClick={() => setActiveView('tasks')}
                          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <span>View Task</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand / Collapse "Why is this #N?" */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : action.id)}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-600 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>Why is this #{action.rank}? (Score Breakdown & Evidence)</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <span className="text-[11px] text-slate-400">
                    Effort: <strong className="text-slate-600">{action.effort}</strong>
                  </span>
                </div>
              </div>

              {/* Expandable Explanation & Score Breakdown Panel */}
              {isExpanded && (
                <div className="bg-slate-50/70 border-t border-slate-100 p-6 space-y-4">
                  {/* Score Formula Table */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/70 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Severity Score</div>
                      <div className="text-base font-extrabold text-slate-800 font-mono tabular-nums">
                        {action.scoreBreakdown.severityScore} / 10
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Frequency Score</div>
                      <div className="text-base font-extrabold text-slate-800 font-mono tabular-nums">
                        {action.scoreBreakdown.frequencyScore} / 10
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Health Risk Multiplier</div>
                      <div className="text-base font-extrabold text-emerald-600 font-mono tabular-nums">
                        {action.scoreBreakdown.healthRiskMultiplier}x
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Final Composite Score</div>
                      <div className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                        {action.scoreBreakdown.finalCompositeScore}
                      </div>
                    </div>
                  </div>

                  {/* Plain Language Rationale */}
                  <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200/70">
                    <span className="font-bold text-slate-900">Ranking Rationale: </span>
                    {action.explanationText}
                  </div>

                  {/* Cited Diner Quotes / Evidence */}
                  <div>
                    <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-slate-400" />
                      <span>Direct Diner Evidence ({action.evidenceItems.length} citations)</span>
                    </div>

                    <div className="space-y-2">
                      {action.evidenceItems.map((ev, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs flex items-start gap-3">
                          <span className="text-amber-500 font-bold font-mono">★ {ev.rating}</span>
                          <div className="flex-1">
                            <p className="italic text-slate-700 font-serif">"{ev.quote}"</p>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {ev.meal} · {ev.date}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note if Approved */}
                  {action.approvalNote && (
                    <div className="text-xs text-emerald-800 bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <strong>Approval Audit: </strong>
                        <span>{action.approvalNote}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600">{action.approvedBy}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Approve / Reject Modal Dialog */}
      {activeModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalType === 'approve' ? 'Approve Action & Generate Task' : 'Reject Action'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Action #{activeModalAction.rank}: {activeModalAction.issue}</p>
              </div>
              <button
                onClick={() => setActiveModalAction(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Supervisor Execution Note / Instructions
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Enter operational directive or verification instructions..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {modalType === 'approve' && (
                <div className="text-xs text-slate-600 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                  <strong>Task Dispatch: </strong> Approving will immediately generate an actionable task assigned to{' '}
                  <span className="font-semibold text-emerald-800">{activeModalAction.ownerRole}</span>.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAction(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition shadow-xs cursor-pointer ${
                    modalType === 'approve'
                      ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  }`}
                >
                  {modalType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
