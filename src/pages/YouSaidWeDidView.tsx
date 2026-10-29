import React from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { Megaphone, CheckCircle2, TrendingUp, Calendar, ShieldCheck, ArrowRight, Info } from 'lucide-react';

export const YouSaidWeDidView: React.FC = () => {
  const { activeOrg, setActiveView } = useApp();
  const items = api.getPublicYouSaidWeDid(activeOrg.slug);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">Public Transparency Board:</span> This public board shows student suggestions and the actual kitchen modifications made by management, along with quantified outcomes.
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Megaphone className="w-3.5 h-3.5" />
          <span>Campus Dining Transparency</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          You Said, We Did
        </h2>
        <p className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
          Every suggestion is reviewed by the mess management committee. Here are recent changes driven directly by your feedback.
        </p>
      </div>

      {/* List of Resolved Items */}
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {item.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Resolved {item.resolvedDate}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* You Said */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wide text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>You Said</span>
                </div>
                <p className="text-xs text-slate-800 font-serif italic leading-relaxed">
                  "{item.youSaid}"
                </p>
              </div>

              {/* We Did */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>We Did</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {item.weDid}
                </p>
              </div>
            </div>

            {/* Impact Metric & Verification */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Measured Impact: {item.impactMetric}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Verified by {item.verifiedBy}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer prompt */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-bold text-sm">Have more ideas to improve the food?</div>
          <div className="text-xs text-slate-400 mt-0.5">Your input makes an immediate difference in next week's menu.</div>
        </div>
        <button
          onClick={() => setActiveView('feedback')}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shrink-0"
        >
          Submit Feedback Now
        </button>
      </div>
    </div>
  );
};
