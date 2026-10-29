import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  TrendingUp,
  CheckSquare,
  MessageSquarePlus,
  Megaphone,
  BarChart3,
  Users2,
  Sliders,
  FileText,
  Sparkles,
  ChevronRight,
  LogOut,
  Target,
  QrCode
} from 'lucide-react';
import { useApp, AppView } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, can, currentUser, setIsGoalsModalOpen } = useApp();

  interface NavItem {
    id: AppView;
    label: string;
    icon: React.ElementType;
    permission?: string;
  }

  const navItems: NavItem[] = [
    { id: 'phase1_foundation', label: 'Phase 1 Foundation', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    { id: 'actions', label: 'Action Board', icon: ShieldAlert, permission: 'action.approve' },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp, permission: 'forecast.view' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, permission: 'task.view' },
    { id: 'feedback', label: 'Feedback Form', icon: MessageSquarePlus, permission: 'feedback.submit' },
    { id: 'qr_deployment', label: 'Canteen QR Studio', icon: QrCode },
    { id: 'you_said_we_did', label: 'You Said, We Did', icon: Megaphone }, // Public board, always visible
    { id: 'impact', label: 'Impact Report', icon: BarChart3, permission: 'report.view' },
    { id: 'roles_matrix', label: 'Roles & Access', icon: Users2, permission: 'roles.manage' },
    { id: 'settings_pipeline', label: 'Pipeline & Settings', icon: Sliders, permission: 'settings.edit' },
    { id: 'audit', label: 'Audit Log', icon: FileText, permission: 'audit.view' },
  ];

  // Filter items strictly based on can() permissions check
  const visibleNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return can(item.permission as any);
  });

  return (
    <aside className="w-64 bg-[#14181B] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-[#22292F] select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center gap-3 border-b border-[#22292F]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            {/* Custom 4-dot / clover icon like the video */}
            <div className="grid grid-cols-2 gap-1">
              <span className="w-2 h-2 rounded-full bg-white"></span>
              <span className="w-2 h-2 rounded-full bg-white/70"></span>
              <span className="w-2 h-2 rounded-full bg-white/70"></span>
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </div>
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              <span>CanteenPulse</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-1.5 py-0.5 rounded">AI</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Dining Ops & Quality</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-250px)] dark-sidebar">
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
            Navigation
          </div>
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-500/25 translate-x-1'
                    : 'text-slate-400 hover:text-white hover:bg-[#1E2429]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Promo & Goals Card (matches video's "Premium And Free Trial" / "Upgrade Pro" card) */}
      <div className="p-4 border-t border-[#22292F] space-y-3">
        <div className="p-3.5 rounded-2xl bg-[#1C2227] border border-[#2B343C] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-white">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Operational Goals</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug mb-3">
            At current pace: 88% compliance target reached before inspection.
          </p>
          <button
            onClick={() => setIsGoalsModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 text-xs font-bold tracking-tight transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Manage Target Goals</span>
          </button>
        </div>

        {/* Active User Footer snippet */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="truncate max-w-[140px] text-slate-300 font-medium">{currentUser.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{currentUser.roleName.split(' ')[0]}</span>
        </div>
      </div>
    </aside>
  );
};
