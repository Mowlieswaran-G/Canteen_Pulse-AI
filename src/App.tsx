/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StudyGoalsModal } from './components/StudyGoalsModal';
import { CreateOrgModal } from './pages/CreateOrgModal';
import { Phase1FoundationView } from './pages/Phase1FoundationView';
import { DashboardView } from './pages/DashboardView';
import { ActionBoardView } from './pages/ActionBoardView';
import { ForecastView } from './pages/ForecastView';
import { TasksView } from './pages/TasksView';
import { FeedbackFormView } from './pages/FeedbackFormView';
import { YouSaidWeDidView } from './pages/YouSaidWeDidView';
import { ImpactView } from './pages/ImpactView';
import { RolesMatrixView } from './pages/RolesMatrixView';
import { SettingsPipelineView } from './pages/SettingsPipelineView';
import { AuditLogView } from './pages/AuditLogView';
import { CanteenQrGenerator } from './components/CanteenQrGenerator';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, toasts, removeToast, isQrModalOpen, setIsQrModalOpen } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'phase1_foundation':
        return <Phase1FoundationView />;
      case 'dashboard':
        return <DashboardView />;
      case 'actions':
        return <ActionBoardView />;
      case 'forecast':
        return <ForecastView />;
      case 'tasks':
        return <TasksView />;
      case 'feedback':
        return <FeedbackFormView />;
      case 'you_said_we_did':
        return <YouSaidWeDidView />;
      case 'impact':
        return <ImpactView />;
      case 'roles_matrix':
        return <RolesMatrixView />;
      case 'settings_pipeline':
        return <SettingsPipelineView />;
      case 'audit':
        return <AuditLogView />;
      case 'qr_deployment':
        return <CanteenQrGenerator />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F6F8FB]">
      {/* Sleek Dark Sidebar (matches video reference) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <Header />
        <main className="flex-1 pb-16">
          {renderActiveView()}
        </main>
      </div>

      {/* Study & Target Goals Modal (matches video reference) */}
      <StudyGoalsModal />

      {/* Create Organization Wizard Modal */}
      <CreateOrgModal />

      {/* Canteen QR Generator Deployment Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <CanteenQrGenerator isModal={true} onClose={() => setIsQrModalOpen(false)} />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl shadow-xl border flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-950 text-white border-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-sky-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span className="font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer shrink-0 text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
