import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/apiClient';
import { Organization } from '../types';
import {
  X,
  Building,
  GraduationCap,
  Briefcase,
  Cross,
  Utensils,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface TemplateCard {
  id: Organization['type'];
  title: string;
  desc: string;
  icon: React.ElementType;
  defaultRoles: string[];
  defaultCategories: string[];
}

export const CreateOrgModal: React.FC = () => {
  const { isCreateOrgModalOpen, setIsCreateOrgModalOpen, showToast, switchOrg } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [orgName, setOrgName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Organization['type']>('college_mess');
  const [locationsStr, setLocationsStr] = useState('Main Cafeteria, East Dining Hall');
  const [adminEmail, setAdminEmail] = useState('');

  const templates: TemplateCard[] = [
    {
      id: 'college_mess',
      title: 'College / University Mess',
      desc: 'Hostel student dining with high volume meal shifts, nutrition tracking, and student council boards.',
      icon: GraduationCap,
      defaultRoles: ['Mess Manager', 'Head Cook / Kitchen Lead', 'Student / Diner', 'Procurement Lead'],
      defaultCategories: ['Food Temperature', 'Taste & Salt', 'Hygiene & Cleanliness', 'Service Speed', 'Dietary/Hygiene'],
    },
    {
      id: 'corporate_cafeteria',
      title: 'Corporate Cafeteria',
      desc: 'Tech campus employee dining, multi-vendor food courts, speed of service, and healthy diet tags.',
      icon: Briefcase,
      defaultRoles: ['Facility Ops Manager', 'Station Lead', 'Employee Diner', 'Vendor Auditor'],
      defaultCategories: ['Presentation', 'Wait Time', 'Healthy Options', 'Cleanliness', 'Billing Accuracy'],
    },
    {
      id: 'hospital_dining',
      title: 'Hospital Dietary Services',
      desc: 'Strict therapeutic diets, allergen isolation, sterilized prep wards, and temperature verification.',
      icon: Cross,
      defaultRoles: ['Chief Dietitian', 'Sterile Kitchen Lead', 'Patient Care Staff', 'Hygiene Inspector'],
      defaultCategories: ['Allergen Isolation', 'Sodium Restriction', 'Holding Temperature', 'Sterilization'],
    },
    {
      id: 'restaurant_chain',
      title: 'Restaurant / Franchise Chain',
      desc: 'Standardized guest culinary experience, recipe adherence, kitchen throughput, and mystery dining.',
      icon: Utensils,
      defaultRoles: ['General Manager', 'Executive Chef', 'Line Cook', 'Guest / Diner'],
      defaultCategories: ['Recipe Fidelity', 'Plating & Freshness', 'Table Turn Time', 'Staff Courtesy'],
    },
  ];

  if (!isCreateOrgModalOpen) return null;

  const currentTpl = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    const locs = locationsStr.split(',').map(l => l.trim()).filter(Boolean);
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      slug,
      name: orgName,
      type: selectedTemplate,
      locations: locs.length > 0 ? locs : ['Main Dining Hall'],
      categories: currentTpl.defaultCategories,
      alertKeywords: {
        en: ['stomach ache', 'food poisoning', 'foreign object', 'hair in food', 'raw meat'],
      },
      healthRiskCategories: ['Food Safety', 'Hygiene & Cleanliness'],
      severityWeights: {
        healthRisk: 3.5,
        frequency: 2.0,
        severity: 2.5,
        recency: 1.5,
      },
      escalationDays: 2,
    };

    api.createOrganization(newOrg, adminEmail || 'admin@dining.org');
    switchOrg(newOrg.id);
    setIsCreateOrgModalOpen(false);
    showToast(`Organization "${newOrg.name}" created from ${currentTpl.title} template!`, 'success');
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Wizard Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Organization Wizard</h3>
            <p className="text-xs text-slate-500 mt-0.5">Step {step} of 4: {step === 1 ? 'Organization Name' : step === 2 ? 'Select Operational Template' : step === 3 ? 'Locations & Admin' : 'Review Seeded Roles'}</p>
          </div>
          <button
            onClick={() => setIsCreateOrgModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dining Facility / Institution Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g., Stanford Oak Dining Commons, IIT Madras Mega Mess"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                Each organization maintains isolated tenant feedback, roles, alert keywords, and multi-agent pipeline executions.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  disabled={!orgName.trim()}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs transition cursor-pointer"
                >
                  <span>Next: Choose Template</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Template Card Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-700 mb-1">
                Select Operational Template (Defines seeded roles & categories)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map(tpl => {
                  const Icon = tpl.icon;
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-900">{tpl.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{tpl.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  <span>Next: Locations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Locations */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dining Locations / Stations (comma-separated)
                </label>
                <input
                  type="text"
                  value={locationsStr}
                  onChange={e => setLocationsStr(e.target.value)}
                  placeholder="e.g., Central Hall, South Wing, Faculty Lounge"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Administrator Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="admin@dining.institution.edu"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                >
                  <span>Next: Review Seeded Roles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Done - Review Seeded Roles */}
          {step === 4 && (
            <form onSubmit={handleFinish} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Ready to Seed Organization: {orgName}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  The {currentTpl.title} template will automatically seed the following domain-native roles and inspection categories:
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Seeded Roles:</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentTpl.defaultRoles.map(r => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Seeded Categories:</div>
                <div className="flex flex-wrap gap-1.5">
                  {currentTpl.defaultCategories.map(c => (
                    <span key={c} className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Organization</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
