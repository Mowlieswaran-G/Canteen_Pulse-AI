import React, { useState } from 'react';
import { X, Edit2, AlertCircle, Plus, Check, ChevronDown, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ResourceGoal {
  id: string;
  name: string;
  progress: string;
  overallTarget: string;
  status: 'Behind' | 'Ahead' | 'On Track';
}

export const StudyGoalsModal: React.FC = () => {
  const {
    isGoalsModalOpen,
    setIsGoalsModalOpen,
    isAddGoalModalOpen,
    setIsAddGoalModalOpen,
    showToast,
  } = useApp();

  const [goals, setGoals] = useState<ResourceGoal[]>([
    {
      id: 'g1',
      name: 'USMLE Step 1 Food Safety & Hygiene Bank',
      progress: '3,200 audits',
      overallTarget: '6,400 audits (2x target)',
      status: 'Behind',
    },
    {
      id: 'g2',
      name: 'Central Mess Station Quality Logs',
      progress: '1,600 / 3,200 audits',
      overallTarget: '6,400 audits',
      status: 'Ahead',
    },
    {
      id: 'g3',
      name: 'HACCP Temperature Critical Logs',
      progress: 'Completed 50%',
      overallTarget: '100% daily logs',
      status: 'Ahead',
    },
    {
      id: 'g4',
      name: 'Student Feedback Resolution Target',
      progress: 'Completed 78%',
      overallTarget: '95% resolution',
      status: 'On Track',
    },
    {
      id: 'g5',
      name: 'Bacterial Produce Sanitization Logs',
      progress: 'Completed 0%',
      overallTarget: '14 consecutive logs',
      status: 'Behind',
    },
  ]);

  // Submodal form state
  const [selectedExam, setSelectedExam] = useState('USMLE STEP 1 / Campus Hygiene Audit');
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const [resourceChecked, setResourceChecked] = useState(true);
  const [progressVal, setProgressVal] = useState('1600 / 3200 questions');
  const [targetMultiplier, setTargetMultiplier] = useState('2x');
  const [totalQuestions, setTotalQuestions] = useState('6,400');

  const examOptions = [
    'Pre-clinical Med school exams',
    'Clinical Med school exams',
    'USMLE STEP 1 / Campus Hygiene Audit',
    'USMLE Step 2',
    'USMLE Step 3',
    'FSSAI State Campus Regulatory Audit',
    'Other Institutional Review',
  ];

  if (!isGoalsModalOpen && !isAddGoalModalOpen) return null;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddGoalModalOpen(false);
    showToast('Operational study goals updated successfully!', 'success');
  };

  return (
    <>
      {/* 1. Main Study Goals Modal (recreating video's Study Goals window) */}
      {isGoalsModalOpen && !isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Study & Operational Goals</h3>
                <p className="text-xs text-slate-500 mt-0.5">Target benchmarks for kitchen compliance and quality logs</p>
              </div>
              <button
                onClick={() => setIsGoalsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Goals Table matching video */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                      <th className="pb-3 pl-2">Resource</th>
                      <th className="pb-3">Progress</th>
                      <th className="pb-3">Overall Target</th>
                      <th className="pb-3 text-center">Status</th>
                      <th className="pb-3 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {goals.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 pl-2 font-semibold text-slate-800">
                          {g.name}
                        </td>
                        <td className="py-3.5 font-mono tabular-nums text-emerald-600 font-semibold">
                          {g.progress}
                        </td>
                        <td className="py-3.5 text-slate-600 font-mono tabular-nums">
                          {g.overallTarget}
                        </td>
                        <td className="py-3.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              g.status === 'Ahead'
                                ? 'bg-emerald-50 text-emerald-700'
                                : g.status === 'On Track'
                                ? 'bg-sky-50 text-sky-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {g.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <button
                            onClick={() => {
                              setIsGoalsModalOpen(false);
                              setIsAddGoalModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Forecast Banner matching video */}
              <div className="mt-5 p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <span>AI Forecast</span>
                  </div>
                  <div className="text-rose-700 mt-0.5">
                    At this pace, you'll finish <span className="font-bold font-mono">83%</span> of your plan before the scheduled audit.
                  </div>
                </div>
              </div>

              {/* Action Buttons matching video */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsGoalsModalOpen(false);
                    setIsAddGoalModalOpen(true);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>

                <button
                  onClick={() => setIsGoalsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Manage Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Update Study Progress Submodal (matches video at 00:10 - 00:19) */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header with Title & Close X */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Update Study Progress</h3>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-5">
              {/* Select Your Exam Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Your Exam / Audit Benchmark
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExamDropdownOpen(!examDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 text-left hover:border-slate-300 transition cursor-pointer"
                  >
                    <span className="font-medium truncate">{selectedExam}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>

                  {examDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 z-50 max-h-52 overflow-y-auto">
                      {examOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setSelectedExam(opt);
                            setExamDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition cursor-pointer ${
                            selectedExam === opt
                              ? 'bg-emerald-50 text-emerald-800 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Select Study Resources and Goals */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Study Resources and Goals
                </label>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="resourceCheck"
                      checked={resourceChecked}
                      onChange={e => setResourceChecked(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="resourceCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Medical Student AI Bank / Quality Logs
                    </label>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-6">
                      <input
                        type="text"
                        value={progressVal}
                        onChange={e => setProgressVal(e.target.value)}
                        placeholder="Type Here"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-2 text-center text-slate-400 font-mono">
                      <input
                        type="text"
                        value={targetMultiplier}
                        onChange={e => setTargetMultiplier(e.target.value)}
                        placeholder="2x"
                        className="w-full p-2.5 text-center rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={totalQuestions}
                        onChange={e => setTotalQuestions(e.target.value)}
                        placeholder="6,400"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Large Bright Green Gradient Button matching video: "Save Study Goals" */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm tracking-tight shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.99] cursor-pointer"
              >
                Save Study Goals
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
