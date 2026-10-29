import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { WeeklyPlanDay } from '../types';

interface SchedulePlanProps {
  days: WeeklyPlanDay[];
  onAddSchedule?: () => void;
}

export const SchedulePlan: React.FC<SchedulePlanProps> = ({ days, onAddSchedule }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
      {/* Header matching video: "Study Schedule Plan" with "+ Add schedule" button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Weekly Operational Plan</h2>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span className="font-semibold text-slate-700">October 2026</span>
            <span>·</span>
            <span>Meal Shifts & Station Audits</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-medium text-slate-700">Week 44</span>
            <button className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onAddSchedule}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-semibold shadow-sm shadow-emerald-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add schedule</span>
          </button>
        </div>
      </div>

      {/* 5-day calendar columns matching video */}
      <div className="grid grid-cols-5 gap-3">
        {days.map(d => {
          return (
            <div
              key={d.date}
              className={`rounded-xl p-3 border transition-all ${
                d.isToday
                  ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">{d.dayName}</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums ${
                    d.isToday ? 'text-emerald-700' : 'text-slate-800'
                  }`}
                >
                  {d.date}
                </span>
              </div>

              {/* Shift badges */}
              <div className="space-y-1.5">
                {d.shifts.map(shift => (
                  <div
                    key={shift.id}
                    className="p-1.5 rounded-lg text-[10px] font-medium leading-tight shadow-2xs border text-slate-800 truncate"
                    style={{
                      backgroundColor: `${shift.badgeColor}15`,
                      borderColor: `${shift.badgeColor}35`,
                      color: shift.badgeColor,
                    }}
                    title={shift.title}
                  >
                    {shift.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
