import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { PipelineProgressEvent, LLMUsageRecord } from '../types';
import {
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Layers,
  Save,
  Info,
  Sliders,
  AlertTriangle,
  PauseCircle
} from 'lucide-react';

export const SettingsPipelineView: React.FC = () => {
  const { activeOrg, showToast, refreshState } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [pipelineEvents, setPipelineEvents] = useState<PipelineProgressEvent[]>(() => api.getPipelineProgress());
  const [llmUsage, setLlmUsage] = useState<LLMUsageRecord[]>(() => api.getLLMUsage());

  // Settings state
  const [categories, setCategories] = useState<string>(activeOrg.categories.join(', '));
  const [escalationDays, setEscalationDays] = useState<number>(activeOrg.escalationDays);
  const [healthWeight, setHealthWeight] = useState<number>(activeOrg.severityWeights.healthRisk);
  const [frequencyWeight, setFrequencyWeight] = useState<number>(activeOrg.severityWeights.frequency);
  const [alertKeywordsEn, setAlertKeywordsEn] = useState<string>(
    (activeOrg.alertKeywords['en'] || []).join(', ')
  );
  const [alertKeywordsHi, setAlertKeywordsHi] = useState<string>(
    (activeOrg.alertKeywords['hi'] || []).join(', ')
  );

  const handleRunPipeline = async () => {
    try {
      setIsRunning(true);
      showToast('Initiating multi-agent feedback pipeline run...', 'info');
      const updatedEvents = await api.runPipeline();
      setPipelineEvents([...updatedEvents]);
      setLlmUsage(api.getLLMUsage());
      setIsRunning(false);
      refreshState();
      showToast('Pipeline execution paused at Human-in-the-Loop manager approval checkpoint!', 'success');
    } catch (err: any) {
      setIsRunning(false);
      showToast(err.message, 'error');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    activeOrg.categories = categories.split(',').map(c => c.trim()).filter(Boolean);
    activeOrg.escalationDays = escalationDays;
    activeOrg.severityWeights.healthRisk = healthWeight;
    activeOrg.severityWeights.frequency = frequencyWeight;
    activeOrg.alertKeywords['en'] = alertKeywordsEn.split(',').map(k => k.trim()).filter(Boolean);
    activeOrg.alertKeywords['hi'] = alertKeywordsHi.split(',').map(k => k.trim()).filter(Boolean);

    refreshState();
    showToast('Dining operational settings and severity weights updated!', 'success');
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Pipeline & Settings Guide:</span> Trigger the end-to-end multi-agent graph (PII Redactor → Aspect Sentiment → Forecast Engine → Action Ranker). Monitor real-time node progress and inspect LLM token consumption & cost ledger.
        </div>
      </div>

      {/* Pipeline Runner Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>Multi-Agent LangGraph Pipeline</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Run Feedback Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Processes raw diner submissions across languages, redacts PII, forecasts recurrence, and computes ranked action cards
            </p>
          </div>

          <button
            onClick={handleRunPipeline}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs tracking-wide transition shadow-md cursor-pointer ${
              isRunning
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Running Pipeline Agents...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Pipeline Now</span>
              </>
            )}
          </button>
        </div>

        {/* Live Step-by-Step Graph Node Progress List */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Execution Graph Node Events (/pipeline/progress)
          </div>

          <div className="space-y-2">
            {pipelineEvents.map((evt, idx) => {
              let statusBadge = (
                <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending</span>
                </span>
              );

              if (evt.status === 'completed') {
                statusBadge = (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed {evt.finishedAt ? `(${evt.finishedAt})` : ''}</span>
                  </span>
                );
              } else if (evt.status === 'running') {
                statusBadge = (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 animate-pulse">
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing Node...</span>
                  </span>
                );
              } else if (evt.status === 'paused') {
                statusBadge = (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Paused for Manager Approval</span>
                  </span>
                );
              }

              return (
                <div
                  key={evt.nodeId}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                    evt.status === 'running'
                      ? 'bg-indigo-50/70 border-indigo-200'
                      : evt.status === 'paused'
                      ? 'bg-amber-50/70 border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{evt.nodeName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{evt.message}</div>
                    </div>
                  </div>

                  <div className="self-start sm:self-center shrink-0">
                    {statusBadge}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LLM Usage & Cost Ledger Table */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">LLM Usage & Cost Ledger (llm_usage)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Token tracking across pipeline agent inferences</p>
          </div>
          <div className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-3 py-1.5 rounded-xl">
            Total USD: ${llmUsage.reduce((acc, u) => acc + u.estimatedCostUSD, 0).toFixed(4)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold bg-slate-50">
                <th className="py-2.5 pl-4">Timestamp</th>
                <th className="py-2.5">Agent Node</th>
                <th className="py-2.5">Model</th>
                <th className="py-2.5 text-right font-mono">Prompt Tokens</th>
                <th className="py-2.5 text-right font-mono">Completion Tokens</th>
                <th className="py-2.5 pr-4 text-right font-mono">Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {llmUsage.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 pl-4 text-slate-500 font-mono text-[11px]">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 font-semibold text-slate-800">{record.agentNode}</td>
                  <td className="py-3 text-slate-600 font-mono text-[11px]">{record.model}</td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                    {record.promptTokens.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums text-slate-700">
                    {record.completionTokens.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono tabular-nums font-bold text-emerald-700">
                    ${record.estimatedCostUSD.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Form: Categories, Weights, Keywords */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-600" />
            <h3 className="text-base font-bold text-slate-900">Organization Dining Parameters</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Tune composite severity scoring multipliers and alert triggers</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tracked Feedback Categories (comma-separated)
              </label>
              <input
                type="text"
                value={categories}
                onChange={e => setCategories(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Escalation Threshold (Days without action)
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={escalationDays}
                onChange={e => setEscalationDays(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Health Risk Multiplier Weight ({healthWeight}x)
              </label>
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.1}
                value={healthWeight}
                onChange={e => setHealthWeight(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 mt-1">Multiplies foreign objects and food poisoning complaints</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency Weight ({frequencyWeight}x)
              </label>
              <input
                type="range"
                min={1.0}
                max={4.0}
                step={0.1}
                value={frequencyWeight}
                onChange={e => setFrequencyWeight(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 mt-1">Amplifies recurring shift complaints</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                English Critical Alert Keywords
              </label>
              <textarea
                rows={2}
                value={alertKeywordsEn}
                onChange={e => setAlertKeywordsEn(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hindi / Regional Alert Keywords
              </label>
              <textarea
                rows={2}
                value={alertKeywordsHi}
                onChange={e => setAlertKeywordsHi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
