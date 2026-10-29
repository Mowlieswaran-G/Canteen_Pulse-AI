import React from 'react';
import { ShieldCheck, Calendar, Info } from 'lucide-react';

interface ReadinessGaugeProps {
  score?: number;
  daysRemaining?: number;
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({
  score = 86,
  daysRemaining = 4,
}) => {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
      {/* Header matching video: "Exam Date Reminder" */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Audit Readiness Reminder</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Campus HACCP
        </span>
      </div>

      <div className="flex items-center gap-6 my-2">
        {/* Circular Gauge */}
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
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-base font-extrabold text-slate-900 font-mono tabular-nums">{score}%</span>
            <span className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold">Pass</span>
          </div>
        </div>

        {/* Legend status list matching video */}
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
            <span className="text-slate-500">Not Ready (&lt; 50%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="text-slate-500">Needs Improvement</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
            <span>Approaching Readiness</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>FSSAI Official Inspection:</span>
        </span>
        <span className="font-bold text-slate-900 font-mono tabular-nums">{daysRemaining} days left</span>
      </div>
    </div>
  );
};
