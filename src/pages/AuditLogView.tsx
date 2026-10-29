import React, { useState } from 'react';
import { api } from '../services/apiClient';
import { FileText, Search, ShieldCheck, Filter, Info } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const auditLogs = api.getAuditLog(searchTerm);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Audit Trail Guide:</span> Immutable compliance log of all managerial approvals, alert acknowledgments, task completions with photos, role permission updates, and pipeline executions.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Compliance & Audit Trail</h2>
          <p className="text-xs text-slate-500 mt-0.5">Chronological record of operational events and human-in-the-loop decisions</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by actor, action, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50">
                <th className="py-3 pl-6">Timestamp</th>
                <th className="py-3">Actor & Role</th>
                <th className="py-3">Action Type</th>
                <th className="py-3">Entity</th>
                <th className="py-3 pr-6">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pl-6 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3.5 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{log.actorName}</div>
                    <div className="text-[10px] text-slate-500">{log.actorRole}</div>
                  </td>

                  <td className="py-3.5 whitespace-nowrap">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3.5 text-slate-600 font-medium whitespace-nowrap">
                    {log.entityType} ({log.entityId.slice(0, 8)})
                  </td>

                  <td className="py-3.5 pr-6 text-slate-700 text-xs leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
