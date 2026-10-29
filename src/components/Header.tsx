import React, { useState } from 'react';
import {
  Bell,
  Building2,
  ChevronDown,
  UserCheck,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';

export const Header: React.FC = () => {
  const {
    currentUser,
    activeOrg,
    switchUser,
    switchOrg,
    setIsCreateOrgModalOpen,
    setActiveView,
    can,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);

  const demoUsers = api.getDemoUsers();
  const orgs = api.getOrganizations();
  const canReceiveAlerts = can('alerts.receive');
  const unackedAlertsCount = canReceiveAlerts ? api.getAlerts().filter(a => !a.acknowledged).length : 0;

  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      {/* Welcome Greeting matching video: "Welcome Sarah ! Let's see what we are doing today!" */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome {currentUser.name.split(' ')[0]} !
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {currentUser.roleName}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <span>Let's see what we are doing today in</span>
          <span className="font-semibold text-slate-700">{activeOrg.name}</span>
          <span>·</span>
          <span>{currentUser.location}</span>
        </p>
      </div>

      {/* Action Controls & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Role Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setOrgMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer"
            title="Switch user role to test role-based access"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">Role:</span>
            <span className="font-semibold text-slate-900">{currentUser.roleName.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Demo User & Role
              </div>
              <div className="space-y-1 mt-1">
                {demoUsers.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-medium'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.roleName}</div>
                      </div>
                      {isCurrent && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setOrgMenuOpen(!orgMenuOpen);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span className="max-w-[130px] truncate font-semibold text-slate-900">{activeOrg.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {orgMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Organizations
              </div>
              <div className="space-y-1 mt-1">
                {orgs.map(org => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrg(org.id);
                      setOrgMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      org.id === activeOrg.id
                        ? 'bg-emerald-50 font-semibold text-emerald-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  onClick={() => {
                    setIsCreateOrgModalOpen(true);
                    setOrgMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Organization Wizard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Alerts Bell (shown only if role can receive alerts) */}
        {canReceiveAlerts && (
          <button
            onClick={() => setActiveView('actions')}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            title="Open Action Board & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unackedAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-white" />
            )}
          </button>
        )}

        {/* Public Board Link button */}
        <button
          onClick={() => setActiveView('you_said_we_did')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition cursor-pointer"
        >
          <span>Public Board</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/20">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
