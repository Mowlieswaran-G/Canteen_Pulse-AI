import React from 'react';
import { StationSystemMetric } from '../types';

interface SystemListTableProps {
  systems: StationSystemMetric[];
  onViewAll?: () => void;
}

export const SystemListTable: React.FC<SystemListTableProps> = ({ systems, onViewAll }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      {/* Header matching video: "All System List" + "View All" */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">All System & Station List</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live station compliance and quality ratios from diner logs</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer hover:underline"
        >
          View All
        </button>
      </div>

      {/* Table matching video layout */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
              <th className="pb-3 pl-2">System Name</th>
              <th className="pb-3 text-center">Completed (%)</th>
              <th className="pb-3 text-center">Percent Correct (%)</th>
              <th className="pb-3 pr-2 min-w-[180px]">Correct vs Incorrect answer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {systems.map(sys => {
              const incorrectPercent = 100 - sys.percentCorrect;
              return (
                <tr key={sys.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="py-3.5 pl-2">
                    <div className="font-semibold text-slate-800">{sys.name}</div>
                    <div className="text-[10px] text-slate-400">{sys.category} · {sys.feedbackCount} responses</div>
                  </td>

                  <td className="py-3.5 text-center font-mono tabular-nums font-medium text-slate-700">
                    {sys.completedPercent}%
                  </td>

                  <td className="py-3.5 text-center font-mono tabular-nums font-semibold text-slate-900">
                    {sys.percentCorrect}%
                  </td>

                  {/* Dual-Color Correct vs Incorrect Bar (the exact visual from the video) */}
                  <td className="py-3.5 pr-2">
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
                        {/* Green: Positive / Correct */}
                        <div
                          style={{ width: `${sys.percentCorrect}%` }}
                          className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                          title={`Positive: ${sys.percentCorrect}%`}
                        />
                        {/* Red: Negative / Incorrect */}
                        <div
                          style={{ width: `${incorrectPercent}%` }}
                          className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                          title={`Negative/Complaints: ${incorrectPercent}%`}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
