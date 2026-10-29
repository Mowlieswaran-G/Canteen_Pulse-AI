import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { BarChart3, CheckCircle2, TrendingUp, Calendar, Info, Award } from 'lucide-react';

export const ImpactView: React.FC = () => {
  const completedActions = api.getActions().filter(a => a.status === 'approved' || a.status === 'completed');

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Impact Ledger:</span> Summarizes completed actions from the multi-agent pipeline and documents the operational metrics improved following managerial sign-off.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operational Impact Report</h2>
          <p className="text-xs text-slate-500 mt-0.5">Quantified outcomes and audit proof of implemented resolutions</p>
        </div>
      </div>

      {/* Top Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Actions Implemented</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {completedActions.length + 3}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% on-time execution</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Average Resolution Time</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            18.5 hrs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">From diner feedback to shift task execution</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Net Satisfaction Lift</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            +14.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Since activating CanteenPulse pipeline</div>
        </div>
      </div>

      {/* Completed Actions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-sm text-slate-900">
          Implemented Interventions & Logged Results
        </div>

        <div className="divide-y divide-slate-100">
          {completedActions.map(act => (
            <div key={act.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Action #{act.rank}: {act.issue}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                    Implemented
                  </span>
                </div>
                <div className="text-xs text-slate-600">{act.recommendation}</div>
                {act.approvalNote && (
                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                    Directive: "{act.approvalNote}" · Authorized by {act.approvedBy}
                  </div>
                )}
              </div>

              <div className="text-xs text-right shrink-0">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  Targeted Metric: +28% satisfaction
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
