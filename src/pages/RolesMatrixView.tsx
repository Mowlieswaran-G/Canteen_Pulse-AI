import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { PermissionKey, RoleDefinition, User } from '../types';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Mail,
  UserPlus,
  Save,
  Info,
  Check,
  X
} from 'lucide-react';

export const RolesMatrixView: React.FC = () => {
  const { roles, refreshState, showToast, currentUser } = useApp();
  const [matrixState, setMatrixState] = useState<{ [roleId: string]: PermissionKey[] }>(() => {
    const map: { [roleId: string]: PermissionKey[] } = {};
    roles.forEach(r => {
      map[r.id] = [...r.permissions];
    });
    return map;
  });

  useEffect(() => {
    setMatrixState(prev => {
      const map: { [roleId: string]: PermissionKey[] } = { ...prev };
      roles.forEach(r => {
        if (!map[r.id]) {
          map[r.id] = [...r.permissions];
        }
      });
      return map;
    });
  }, [roles]);

  const [members, setMembers] = useState<User[]>(() => api.getDemoUsers());

  // Create Role Modal
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  // Invite Member Modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState(roles[0]?.id || '');
  const [inviteLocation, setInviteLocation] = useState('Central Dining Hall');

  const allPermissions: { key: PermissionKey; label: string; group: string }[] = [
    { key: 'dashboard.view', label: 'View Dashboard', group: 'Analytics' },
    { key: 'forecast.view', label: 'View Forecasts', group: 'Analytics' },
    { key: 'report.view', label: 'View Reports', group: 'Analytics' },
    { key: 'action.approve', label: 'Approve Actions', group: 'Operations' },
    { key: 'alerts.receive', label: 'Receive Alerts', group: 'Operations' },
    { key: 'task.view', label: 'View Tasks', group: 'Tasks' },
    { key: 'task.complete', label: 'Complete Tasks', group: 'Tasks' },
    { key: 'feedback.submit', label: 'Submit Feedback', group: 'Diners' },
    { key: 'roles.manage', label: 'Manage Roles', group: 'Admin' },
    { key: 'users.manage', label: 'Manage Users', group: 'Admin' },
    { key: 'settings.edit', label: 'Edit Settings & Pipeline', group: 'Admin' },
    { key: 'audit.view', label: 'View Audit Log', group: 'Admin' },
  ];

  const togglePermission = (roleId: string, perm: PermissionKey) => {
    setMatrixState(prev => {
      const current = prev[roleId] || [];
      const updated = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm];
      return { ...prev, [roleId]: updated };
    });
  };

  const handleSaveMatrix = (roleId: string) => {
    try {
      const perms = matrixState[roleId] || [];
      api.updateRolePermissions(roleId, perms);
      refreshState();
      showToast('Permissions matrix saved! Changes applied immediately to navigation.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    api.createRole(newRoleName, newRoleDesc, ['dashboard.view', 'task.view']);
    refreshState();
    setIsCreateRoleOpen(false);
    setNewRoleName('');
    setNewRoleDesc('');
    showToast(`Role "${newRoleName}" created successfully!`, 'success');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    const role = roles.find(r => r.id === inviteRoleId);
    const newMember: User = {
      id: `user_${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      roleId: inviteRoleId,
      roleName: role ? role.name : 'Staff',
      location: inviteLocation,
    };

    setMembers(prev => [...prev, newMember]);
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
    showToast(`Invited ${inviteName} as ${newMember.roleName}!`, 'success');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast('Member removed from organization.', 'info');
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* 30-Second Summary Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-bold">30-Second Access Matrix Guide:</span> Configure role permissions with checkboxes. Modifying a checkbox and clicking Save updates what pages each role sees immediately via dynamic <code>can(permission)</code> validation.
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Role Permissions Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">Define fine-grained access control across campus dining operators</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Invite Member</span>
          </button>

          <button
            onClick={() => setIsCreateRoleOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>
      </div>

      {/* Permission Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-3.5 pl-6 min-w-[200px]">Permission Key</th>
                {roles.map(r => (
                  <th key={r.id} className="py-3.5 px-4 text-center min-w-[130px]">
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <button
                      onClick={() => handleSaveMatrix(r.id)}
                      className="mt-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 cursor-pointer"
                    >
                      <Save className="w-2.5 h-2.5" />
                      <span>Save</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPermissions.map(perm => (
                <tr key={perm.key} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 pl-6">
                    <div className="font-medium text-slate-800">{perm.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{perm.key}</div>
                  </td>

                  {roles.map(r => {
                    const isChecked = (matrixState[r.id] || []).includes(perm.key);
                    return (
                      <td key={r.id} className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(r.id, perm.key)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Members List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Organization Members</h3>
          <span className="text-xs text-slate-400">{members.length} operators</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(m => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{m.name}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{m.roleName}</span>
                    <span>·</span>
                    <span>{m.location}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{m.email}</div>
                </div>
              </div>

              {m.id !== currentUser.id && (
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Remove Member"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Invite Team Member</h3>
              <button onClick={() => setIsInviteOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInviteMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Ananya Roy"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="e.g. ananya@abccollege.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRoleId}
                  onChange={e => setInviteRoleId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {isCreateRoleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Create Custom Role</h3>
              <button onClick={() => setIsCreateRoleOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Name</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  placeholder="e.g. Hygiene Inspector"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="Responsibilities and operational scope..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
