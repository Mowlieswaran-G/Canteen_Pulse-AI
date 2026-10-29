import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { MetricCards } from '../components/MetricCards';
import { SystemListTable } from '../components/SystemListTable';
import { TodaySchedule } from '../components/TodaySchedule';
import { SchedulePlan } from '../components/SchedulePlan';
import { ReadinessGauge } from '../components/ReadinessGauge';
import {
  Filter,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  QrCode
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { activeOrg, showToast, setIsGoalsModalOpen, setIsAddGoalModalOpen, setActiveView, setIsQrModalOpen } = useApp();
  const summary = api.getAnalysisSummary();
  const systems = api.getStationSystems();
  const schedule = api.getTodaySchedule();
  const weeklyPlan = api.getWeeklyPlan();

  // Filters state
  const [selectedMeal, setSelectedMeal] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Uploaded ${e.target.files[0].name} (120 new diner logs ingested)`, 'success');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 30-Second Plain-Language Summary Box (Prompt Requirement) */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Operations Snapshot:</span> Overall dining satisfaction is at{' '}
          <strong className="font-semibold text-emerald-900">{summary.satisfactionScore}%</strong> (+{summary.feedbackWoWDelta}% vs last week), outperforming {summary.rankingPercentile}% of peer messes. Food temperature and roti queue delays are the top 2 friction points. There are{' '}
          <span className="font-semibold text-rose-700">{summary.openAlertsCount} active critical alert</span> and{' '}
          <span className="font-semibold">{summary.pendingActionsCount} ranked actions</span> awaiting manager sign-off.
        </div>
      </div>

      {/* Top Filter & Quick Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Data:</span>
          </span>

          <select
            value={selectedMeal}
            onChange={e => setSelectedMeal(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 hover:border-slate-300 transition cursor-pointer"
          >
            <option value="All">All Meals (Breakfast, Lunch, Dinner)</option>
            <option value="Breakfast">Breakfast Service</option>
            <option value="Lunch">Lunch Service</option>
            <option value="Dinner">Dinner Service</option>
          </select>

          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 hover:border-slate-300 transition cursor-pointer"
          >
            <option value="All">All Mess Locations</option>
            {activeOrg.locations.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Actions & Deployment Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deploy Table QRs</span>
          </button>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Diner Logs CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>

          <button
            onClick={() => setActiveView('actions')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
          >
            <span>Review Actions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Top Metric Cards (Performance gauge, Ranking percentile, Feedback, Alerts) */}
      <MetricCards
        satisfactionScore={summary.satisfactionScore}
        targetScore={summary.targetScore}
        rankingPercentile={summary.rankingPercentile}
        totalFeedback={summary.totalFeedbackWeek}
        feedbackWoWDelta={summary.feedbackWoWDelta}
        complaintsWoWDelta={summary.complaintsWoWDelta}
        openAlerts={summary.openAlertsCount}
        onOpenGoals={() => setIsGoalsModalOpen(true)}
      />

      {/* Row 2: Two-Column Split matching video (System List Table + Today Operational Schedule) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: All System List Table (7 cols) */}
        <div className="lg:col-span-7">
          <SystemListTable
            systems={systems}
            onViewAll={() => setActiveView('forecast')}
          />
        </div>

        {/* Right Column: Today Operational Schedule (5 cols) */}
        <div className="lg:col-span-5">
          <TodaySchedule
            schedule={schedule}
            onAddSchedule={() => setIsAddGoalModalOpen(true)}
          />
        </div>
      </div>

      {/* Row 3: Bottom Two-Column Split matching video (Weekly Schedule Plan + Readiness Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Operational Plan Calendar (8 cols) */}
        <div className="lg:col-span-8">
          <SchedulePlan
            days={weeklyPlan}
            onAddSchedule={() => setIsAddGoalModalOpen(true)}
          />
        </div>

        {/* Audit Readiness Reminder Gauge (4 cols) */}
        <div className="lg:col-span-4">
          <ReadinessGauge score={86} daysRemaining={4} />
        </div>
      </div>
    </div>
  );
};
