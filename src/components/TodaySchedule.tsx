import React from 'react';
import { MoreVertical, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { ScheduleItem } from '../types';

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  onAddSchedule?: () => void;
}

export const TodaySchedule: React.FC<TodayScheduleProps> = ({ schedule, onAddSchedule }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header matching video: "Today Study Schedule" with three dots */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Today Operational Schedule</h2>
            <p className="text-xs text-slate-500 mt-0.5">Meal service shifts and mandatory HACCP checks</p>
          </div>
          <button
            onClick={onAddSchedule}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Schedule options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline item list with vertical connecting line matching video */}
        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {schedule.map(item => {
            let dotColor = 'bg-slate-300';
            let StatusIcon = Clock;

            if (item.status === 'completed') {
              dotColor = 'bg-emerald-500 ring-4 ring-emerald-50';
              StatusIcon = CheckCircle2;
            } else if (item.status === 'in_progress') {
              dotColor = 'bg-indigo-600 ring-4 ring-indigo-50';
              StatusIcon = PlayCircle;
            } else {
              dotColor = 'bg-slate-400 ring-4 ring-slate-100';
            }

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node dot */}
                <span
                  className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ${dotColor} transition-all`}
                />

                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-bold text-slate-500 font-mono tabular-nums tracking-tight">
                    {item.timeRange}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : item.status === 'in_progress'
                      ? 'bg-indigo-50 text-indigo-700 animate-pulse'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="font-semibold text-xs text-slate-900 mt-1 leading-snug">
                  {item.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  {item.subtitle}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <span className="font-medium text-slate-600">{item.assignedRole}</span>
                  <span>·</span>
                  <span>{item.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
