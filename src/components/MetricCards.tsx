import React from 'react';
import { TrendingUp, AlertTriangle, MessageSquare, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardsProps {
  satisfactionScore: number;
  targetScore: number;
  rankingPercentile: number;
  totalFeedback: number;
  feedbackWoWDelta: number;
  complaintsWoWDelta: number;
  openAlerts: number;
  onOpenGoals?: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  satisfactionScore,
  targetScore,
  rankingPercentile,
  totalFeedback,
  feedbackWoWDelta,
  complaintsWoWDelta,
  openAlerts,
  onOpenGoals,
}) => {
  // SVG circular gauge math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (satisfactionScore / 100) * circumference;
  const percentileDashoffset = circumference - (rankingPercentile / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Performance / Satisfaction Score (Matches video's "Performance" card) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">Satisfaction Score</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {satisfactionScore}%
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{feedbackWoWDelta}%</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Target Benchmark: <span className="font-semibold text-slate-700">{targetScore}%</span>
          </div>
        </div>

        {/* Circular SVG Ring (like video's 22% / 77% gauge) */}
        <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="#6366F1"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-800 font-mono tabular-nums">{satisfactionScore}%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-medium">Avg</span>
          </div>
        </div>
      </div>

      {/* 2. Ranking Percentile (Matches video's "Ranking Percentile" 85% / 91st card) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between hover:shadow-md transition">
        <div>
          <div className="text-xs font-semibold text-slate-500 mb-1">Campus Percentile</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {rankingPercentile}th
            </span>
            <span className="text-xs text-slate-400">Percentile</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 leading-tight">
            Maintained higher than <span className="font-semibold text-emerald-600">{rankingPercentile}%</span> of peer dining facilities.
          </div>
        </div>

        {/* Circular Gold/Green Ring */}
        <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="7"
              fill="transparent"
            />
            <circle
              cx="44"
              cy="44"
              r={radius}
              stroke="#10B981"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={percentileDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-emerald-600 font-mono tabular-nums">{rankingPercentile}%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-medium">Top</span>
          </div>
        </div>
      </div>

      {/* 3. Total Feedback Volume */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Weekly Diner Submissions</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono tabular-nums">
              {totalFeedback.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{feedbackWoWDelta}%</span>
            </span>
          </div>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Complaints Delta WoW</span>
          <span className="font-semibold text-emerald-600 font-mono tabular-nums">
            {complaintsWoWDelta}%
          </span>
        </div>
      </div>

      {/* 4. Active Critical Alerts */}
      <div className={`rounded-2xl p-5 border shadow-sm flex flex-col justify-between hover:shadow-md transition ${
        openAlerts > 0
          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}>
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
            <span>Critical Kitchen Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${openAlerts > 0 ? 'text-rose-600 animate-bounce' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight font-mono tabular-nums ${
              openAlerts > 0 ? 'text-rose-700' : 'text-slate-900'
            }`}>
              {openAlerts}
            </span>
            {openAlerts > 0 ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                Action Required
              </span>
            ) : (
              <span className="text-xs text-slate-400">All Clear</span>
            )}
          </div>
        </div>
        <div className="text-[11px] text-slate-600 mt-2 flex items-center justify-between pt-2 border-t border-rose-100">
          <span>Health Risk Triggers</span>
          <span className="font-semibold">{openAlerts > 0 ? 'Salad Counter Inspection' : 'None detected'}</span>
        </div>
      </div>
    </div>
  );
};
