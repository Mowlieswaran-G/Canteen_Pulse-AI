import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { Info, TrendingUp, Calendar, ShieldCheck, CheckCircle2, History } from 'lucide-react';

export const ForecastView: React.FC = () => {
  const forecasts = api.getForecast();
  const backtest = api.getBacktestSummary();

  // Helper to render inline SVG sparkline
  const renderSparkline = (points: number[]) => {
    const min = Math.min(...points);
    const max = Math.max(...points) || 1;
    const width = 80;
    const height = 24;

    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / (max - min || 1)) * (height - 6) - 3;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
        {points.map((p, idx) => {
          const x = (idx / (points.length - 1)) * width;
          const y = height - ((p - min) / (max - min || 1)) * (height - 6) - 3;
          if (idx === points.length - 1) {
            return <circle key={idx} cx={x} cy={y} r="3" fill="#059669" />;
          }
          return null;
        })}
      </svg>
    );
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Risk Forecast Guide:</span> This engine uses Poisson historical recurrence counts to anticipate which dining issues will manifest on specific upcoming meal shifts.
        </div>
      </div>

      {/* Mandatory Label Banner: "Risk levels are based on counted history, not guesses." */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">
              Risk levels are based on counted history, not guesses.
            </div>
            <div className="text-xs text-slate-400">
              Correlated against past student complaints, shift schedules, and supplier delivery logs.
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
          Evaluated across 16 historical dining cycles
        </div>
      </div>

      {/* Forecast Accuracy & Backtest Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">High-Risk Prediction Precision</div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {backtest.precisionHighRisk}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            When flagged High Risk, the issue recurring was confirmed in 7 out of 8 cycles.
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Recall on Operational Failures</div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {backtest.recallHighRisk}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Caught 92% of critical complaints before they escalated to student union reviews.
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Improvement Over Baseline</div>
          <div className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
            +{(backtest.precisionHighRisk - backtest.baselineAccuracy).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Standard static mess manager intuition baseline is ~54%.
          </div>
        </div>
      </div>

      {/* Risk Table Sorted High -> Low */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Predicted Risk Matrix (Sorted High → Low)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical projection for upcoming week based on staff rotations and menu patterns
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 bg-slate-50/50">
                <th className="py-3 pl-6">Operational Issue</th>
                <th className="py-3">Risk Level</th>
                <th className="py-3 min-w-[120px]">Weekly Trend</th>
                <th className="py-3">Likely Day</th>
                <th className="py-3">Historical Occurrences</th>
                <th className="py-3 pr-6 min-w-[280px]">Evidence & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecasts.map(fc => {
                let badgeClass = 'bg-slate-100 text-slate-700';
                if (fc.riskLevel === 'High') badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';
                else if (fc.riskLevel === 'Medium') badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
                else badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';

                return (
                  <tr key={fc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 pl-6 font-semibold text-slate-900">
                      <div>{fc.issue}</div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">{fc.category}</div>
                    </td>

                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] ${badgeClass}`}>
                        {fc.riskLevel}
                      </span>
                    </td>

                    <td className="py-4">
                      {renderSparkline(fc.weeklySparkline)}
                    </td>

                    <td className="py-4 text-slate-800 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{fc.likelyDay}</span>
                      </div>
                    </td>

                    <td className="py-4 font-mono tabular-nums text-slate-700 font-medium">
                      {fc.historicalOccurrences} incidents
                    </td>

                    <td className="py-4 pr-6 text-slate-600 leading-relaxed text-[11px]">
                      {fc.evidenceRationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
