import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { TaskItem } from '../types';
import {
  CheckCircle2,
  Clock,
  Camera,
  AlertCircle,
  MapPin,
  Check,
  X,
  Upload,
  Info
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { currentUser, activeOrg, can, showToast, refreshState } = useApp();
  const [todayOnly, setTodayOnly] = useState(true);
  const [tasks, setTasks] = useState<TaskItem[]>(() => api.getTasks(todayOnly));

  // Modal for Mark Done
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const reload = (filterToday = todayOnly) => {
    setTasks(api.getTasks(filterToday));
    refreshState();
  };

  const handleToggleToday = (val: boolean) => {
    setTodayOnly(val);
    reload(val);
  };

  const openCompleteModal = (task: TaskItem) => {
    setActiveTask(task);
    setCompletionNote('');
    setPhotoPreview(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkDoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    if (!completionNote.trim()) {
      showToast('Please provide a brief completion note or verification temperature.', 'error');
      return;
    }

    // Pass photo URL / simulated upload under /uploads/{org_id}/
    const photoPath = photoPreview ? `/uploads/${activeOrg.id}/photo_${Date.now()}.jpg` : undefined;
    api.completeTask(activeTask.id, completionNote, photoPath);

    showToast(`Task "${activeTask.title}" marked as complete! Stored under /uploads/${activeOrg.id}/`, 'success');
    setActiveTask(null);
    reload();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Kitchen Tasks Guide:</span> This view shows only tasks assigned to your active role ({currentUser.roleName}). Mark items done with a brief note and optional photo for audit logbook verification.
        </div>
      </div>

      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assigned Station Tasks</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role: <strong className="text-slate-700">{currentUser.roleName}</strong> · Location: <strong className="text-slate-700">{currentUser.location}</strong>
          </p>
        </div>

        {/* Big Mobile-Friendly Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => handleToggleToday(true)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              todayOnly
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Today's Tasks
          </button>
          <button
            onClick={() => handleToggleToday(false)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !todayOnly
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Shifts
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No pending tasks for this station today. Great job!
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl border transition-all shadow-2xs ${
                  task.isOverdue && !isCompleted
                    ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-400/20'
                    : isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {task.isOverdue && !isCompleted ? (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Overdue</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          task.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {task.priority} Priority
                        </span>
                      )}

                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due: <strong className={task.isOverdue && !isCompleted ? 'text-rose-700' : 'text-slate-700'}>{task.dueDate}</strong></span>
                      </span>

                      <span className="text-slate-300">·</span>

                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.location}</span>
                      </span>
                    </div>

                    <h3 className={`text-base font-bold tracking-tight ${
                      isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>

                    {isCompleted && task.completionNote && (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 mt-2 flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Completed by {task.completedBy}: "{task.completionNote}"</span>
                      </div>
                    )}
                  </div>

                  {/* Big Touch-Friendly Button matching prompt */}
                  <div className="self-start sm:self-center shrink-0">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Done</span>
                      </span>
                    ) : (
                      can('task.complete') ? (
                        <button
                          onClick={() => openCompleteModal(task)}
                          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Done</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">View Only</span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mark Done Modal Dialog with Photo Upload */}
      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Complete Kitchen Task</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeTask.title}</p>
              </div>
              <button
                onClick={() => setActiveTask(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMarkDoneSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Completion Note / Temperature Log (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={completionNote}
                  onChange={e => setCompletionNote(e.target.value)}
                  placeholder="e.g., Steam well temperature measured at 69°C. Sneeze-guards disinfected."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Photo Upload Option */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Verification Photo (Stored under /uploads/{activeOrg.id}/)
                </label>

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 mb-2 max-h-48">
                    <img src={photoPreview} alt="Upload preview" className="w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition cursor-pointer">
                    <Camera className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">Click to attach audit photo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG supported</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Submit & Mark Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
