"use client";

import { use, useEffect, useState } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon,  KeyIcon, CommandLineIcon, UsersIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { EditableInput } from "@/components/ui/editable-input";

type Account = NonNullable<NonNullable<Project['deployment']>['accounts']>[0];
type EnvConfig = NonNullable<NonNullable<Project['deployment']>['environments']>[0];
type Seed = NonNullable<NonNullable<Project['deployment']>['seeds']>[0];

export default function DeploymentPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [focusedAccId, setFocusedAccId] = useState<string | null>(null);
  const [focusedEnvId, setFocusedEnvId] = useState<string | null>(null);
  const [focusedSeedId, setFocusedSeedId] = useState<string | null>(null);

  useEffect(() => {
    if (!project) {
      fetchProjects();
    }
  }, [project, fetchProjects]);

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const deployment = project.deployment || {};
  const accounts = deployment.accounts || [];
  const environments = deployment.environments || [];
  const seeds = deployment.seeds || [];

  const saveChanges = async (updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  };

  const updateDeploymentField = <K extends keyof NonNullable<Project['deployment']>>(field: K, value: NonNullable<Project['deployment']>[K]) => {
    saveChanges({ deployment: { ...deployment, [field]: value } });
  };

  // Generic helpers for arrays
  const addAccount = () => {
    const newId = `ACC-${Date.now().toString().substring(7)}`;
    setFocusedAccId(newId);
    updateDeploymentField('accounts', [...accounts, { id: newId, platform: "", description: "", email: "", password: "" }]);
  };
  const removeAccount = (id: string) => {
    updateDeploymentField('accounts', accounts.filter(a => a.id !== id));
  };
  const updateAccount = (id: string, field: keyof Account, value: string) => {
    updateDeploymentField('accounts', accounts.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const addEnvironment = () => {
    const newId = `ENV-${Date.now().toString().substring(7)}`;
    setFocusedEnvId(newId);
    updateDeploymentField('environments', [...environments, { id: newId, name: "", value: "" }]);
  };
  const removeEnvironment = (id: string) => {
    updateDeploymentField('environments', environments.filter(e => e.id !== id));
  };
  const updateEnvironment = (id: string, field: keyof EnvConfig, value: string) => {
    updateDeploymentField('environments', environments.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addSeed = () => {
    const newId = `SED-${Date.now().toString().substring(7)}`;
    setFocusedSeedId(newId);
    updateDeploymentField('seeds', [...seeds, { id: newId, role: "", email: "", password: "" }]);
  };
  const removeSeed = (id: string) => {
    updateDeploymentField('seeds', seeds.filter(s => s.id !== id));
  };
  const updateSeed = (id: string, field: keyof Seed, value: string) => {
    updateDeploymentField('seeds', seeds.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="h-full max-w-5xl mx-auto pb-12 space-y-8">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Deployment Configuration</h2>
        <p className="text-foreground-muted mt-2">Manage servers, environments, credentials, and seeds.</p>
      </div>

      {/* Main Settings */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-blue-400" />
            Platform & Environment
          </h3>
        </div>
        <div className="p-6 bg-black/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Deployment Platform</label>
            <EditableInput 
              value={deployment.platform || ""} 
              onSave={(val) => updateDeploymentField('platform', val)}
              placeholder="e.g. Vercel, AWS EC2, DigitalOcean..."
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Live Environment URL</label>
            <EditableInput 
              value={project.liveEnvironment || ""} 
              onSave={(val) => saveChanges({ liveEnvironment: val })}
              placeholder="https://example.com"
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20 outline-none"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground-muted">Repository URL</label>
            <EditableInput 
              value={project.repository || ""} 
              onSave={(val) => saveChanges({ repository: val })}
              placeholder="https://github.com/user/repo"
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20 outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Platform Accounts */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <KeyIcon className="w-5 h-5 text-orange-400" />
            Platform Accounts
          </h3>
          <p className="text-xs text-foreground-muted mt-1">Credentials used for third-party platforms (e.g., Vercel, Supabase, Stripe).</p>
        </div>
        
        <div className="px-6 pt-6">
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex gap-3 text-orange-500">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-semibold">Security Warning</p>
              <p className="text-xs mt-1 opacity-90">Passwords are stored unencrypted in the project database. Please do not store actual production passwords or highly sensitive credentials here. Use a secure vault for production secrets.</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-black/10">
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-medium min-w-[150px]">Platform</th>
                  <th className="px-3 py-3 font-medium min-w-[200px]">Description</th>
                  <th className="px-3 py-3 font-medium min-w-[200px]">Email</th>
                  <th className="px-3 py-3 font-medium min-w-[150px]">Password</th>
                  <th className="px-3 py-3 font-medium w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map(acc => (
                  <tr key={acc.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <td className="p-2"><EditableInput value={acc.platform} onSave={val => updateAccount(acc.id, 'platform', val)} onCtrlEnter={addAccount} autoFocus={acc.id === focusedAccId} placeholder="Supabase" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput value={acc.description} onSave={val => updateAccount(acc.id, 'description', val)} onCtrlEnter={addAccount} placeholder="Database Provider" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput value={acc.email} onSave={val => updateAccount(acc.id, 'email', val)} onCtrlEnter={addAccount} placeholder="admin@example.com" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput type="password" value={acc.password || ""} onSave={val => updateAccount(acc.id, 'password', val)} onCtrlEnter={addAccount} placeholder="••••••••" className="w-full bg-transparent border-none text-foreground font-mono focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2 text-center"><button onClick={() => removeAccount(acc.id)} className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"><TrashIcon className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">No platform accounts added.</td></tr>
                )}
              </tbody>
            </table>
            <div className="p-2 bg-white/[0.02] border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={addAccount} className="w-full text-xs text-foreground-muted hover:text-foreground">
                <PlusIcon className="w-3.5 h-3.5 mr-1.5" /> Add Account
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Environment Configuration */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <CommandLineIcon className="w-5 h-5 text-emerald-400" />
            Environment Configuration (.env)
          </h3>
        </div>
        <div className="p-6 bg-black/10">
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-medium min-w-[250px]">Name</th>
                  <th className="px-3 py-3 font-medium min-w-[300px]">Value</th>
                  <th className="px-3 py-3 font-medium w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {environments.map(env => (
                  <tr key={env.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <td className="p-2"><EditableInput value={env.name} onSave={val => updateEnvironment(env.id, 'name', val)} onCtrlEnter={addEnvironment} autoFocus={env.id === focusedEnvId} placeholder="DATABASE_URL" className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput value={env.value} onSave={val => updateEnvironment(env.id, 'value', val)} onCtrlEnter={addEnvironment} placeholder="..." className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2 text-center"><button onClick={() => removeEnvironment(env.id)} className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"><TrashIcon className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                {environments.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">No environment variables added.</td></tr>
                )}
              </tbody>
            </table>
            <div className="p-2 bg-white/[0.02] border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={addEnvironment} className="w-full text-xs text-foreground-muted hover:text-foreground">
                <PlusIcon className="w-3.5 h-3.5 mr-1.5" /> Add Variable
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* User Seeds */}
      <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-purple-400" />
            User Seeds
          </h3>
          <p className="text-xs text-foreground-muted mt-1">Default credentials pre-populated in the deployment for testing or admin access.</p>
        </div>
        <div className="p-6 bg-black/10">
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-medium min-w-[150px]">Role</th>
                  <th className="px-3 py-3 font-medium min-w-[200px]">Email</th>
                  <th className="px-3 py-3 font-medium min-w-[150px]">Password</th>
                  <th className="px-3 py-3 font-medium w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {seeds.map(seed => (
                  <tr key={seed.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <td className="p-2"><EditableInput value={seed.role} onSave={val => updateSeed(seed.id, 'role', val)} onCtrlEnter={addSeed} autoFocus={seed.id === focusedSeedId} placeholder="Admin" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput value={seed.email} onSave={val => updateSeed(seed.id, 'email', val)} onCtrlEnter={addSeed} placeholder="admin@example.com" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2"><EditableInput type="password" value={seed.password || ""} onSave={val => updateSeed(seed.id, 'password', val)} onCtrlEnter={addSeed} placeholder="••••••••" className="w-full bg-transparent border-none text-foreground font-mono focus:ring-1 focus:ring-accent rounded px-2 py-1.5 outline-none" /></td>
                    <td className="p-2 text-center"><button onClick={() => removeSeed(seed.id)} className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"><TrashIcon className="w-4 h-4" /></button></td>
                  </tr>
                ))}
                {seeds.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">No user seeds added.</td></tr>
                )}
              </tbody>
            </table>
            <div className="p-2 bg-white/[0.02] border-t border-white/5">
              <Button variant="ghost" size="sm" onClick={addSeed} className="w-full text-xs text-foreground-muted hover:text-foreground">
                <PlusIcon className="w-3.5 h-3.5 mr-1.5" /> Add Seed
              </Button>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
