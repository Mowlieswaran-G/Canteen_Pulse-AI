import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { Organization, PermissionKey, RoleDefinition, User } from '../types';

export type AppView =
  | 'phase1_foundation'
  | 'dashboard'
  | 'actions'
  | 'forecast'
  | 'tasks'
  | 'feedback'
  | 'you_said_we_did'
  | 'impact'
  | 'roles_matrix'
  | 'settings_pipeline'
  | 'audit'
  | 'qr_deployment';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User;
  activeOrg: Organization;
  roles: RoleDefinition[];
  permissions: PermissionKey[];
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  can: (permission: PermissionKey) => boolean;
  switchUser: (userId: string) => void;
  switchOrg: (orgId: string) => void;
  refreshState: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isGoalsModalOpen: boolean;
  setIsGoalsModalOpen: (open: boolean) => void;
  isAddGoalModalOpen: boolean;
  setIsAddGoalModalOpen: (open: boolean) => void;
  isCreateOrgModalOpen: boolean;
  setIsCreateOrgModalOpen: (open: boolean) => void;
  isQrModalOpen: boolean;
  setIsQrModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState(() => api.getMe());
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const refreshState = () => {
    setSession(api.getMe());
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const can = (permission: PermissionKey): boolean => {
    return session.permissions.includes(permission);
  };

  const switchUser = (userId: string) => {
    api.switchUser(userId);
    const newSession = api.getMe();
    setSession(newSession);

    // If new role cannot access current view, switch to first allowed view
    const p = newSession.permissions;
    const viewPermissionMap: Record<AppView, PermissionKey | null> = {
      phase1_foundation: null,
      dashboard: 'dashboard.view',
      actions: 'action.approve',
      forecast: 'forecast.view',
      tasks: 'task.view',
      feedback: 'feedback.submit',
      you_said_we_did: null,
      impact: 'report.view',
      roles_matrix: 'roles.manage',
      settings_pipeline: 'settings.edit',
      audit: 'audit.view',
      qr_deployment: null,
    };

    const requiredPerm = viewPermissionMap[activeView];
    if (requiredPerm && !p.includes(requiredPerm)) {
      if (p.includes('dashboard.view')) setActiveView('dashboard');
      else if (p.includes('task.view')) setActiveView('tasks');
      else if (p.includes('feedback.submit')) setActiveView('feedback');
      else if (p.includes('report.view')) setActiveView('impact');
      else setActiveView('you_said_we_did');
    }

    showToast(`Switched active role to ${newSession.user.roleName} (${newSession.user.name})`, 'info');
  };

  const switchOrg = (orgId: string) => {
    api.switchOrg(orgId);
    setSession(api.getMe());
    showToast(`Switched active organization to ${api.getMe().activeOrg.name}`, 'info');
  };

  // Check URL query parameters for QR deep links like ?org=...&item=...&meal=...
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orgParam = urlParams.get('org');
    if (orgParam) {
      const matchOrg = api.getOrganizations().find(o => o.slug === orgParam || o.id === orgParam);
      if (matchOrg) {
        api.switchOrg(matchOrg.id);
        setSession(api.getMe());
      }
      setActiveView('feedback');
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser: session.user,
        activeOrg: session.activeOrg,
        roles: session.roles,
        permissions: session.permissions,
        activeView,
        setActiveView,
        can,
        switchUser,
        switchOrg,
        refreshState,
        toasts,
        showToast,
        removeToast,
        isGoalsModalOpen,
        setIsGoalsModalOpen,
        isAddGoalModalOpen,
        setIsAddGoalModalOpen,
        isCreateOrgModalOpen,
        setIsCreateOrgModalOpen,
        isQrModalOpen,
        setIsQrModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
