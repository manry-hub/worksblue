"use client";

import { use, useEffect } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, RocketLaunchIcon, KeyIcon, CommandLineIcon, UsersIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

type Account = NonNullable<NonNullable<Project['deployment']>['accounts']>[0];
type EnvConfig = NonNullable<NonNullable<Project['deployment']>['environments']>[0];
type Seed = NonNullable<NonNullable<Project['deployment']>['seeds']>[0];

export default function DeploymentPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

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
            <input 
              type="text" 
              value={deployment.platform || ""} 
              onChange={(e) => updateDeploymentField('platform', e.target.value)}
              placeholder="e.g. Vercel, AWS EC2, DigitalOcean..."
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground-muted">Live Environment URL</label>
            <input 
              type="text" 
              value={project.liveEnvironment || ""} 
              onChange={(e) => saveChanges({ liveEnvironment: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-foreground-muted">Repository URL</label>
            <input 
              type="text" 
              value={project.repository || ""} 
              onChange={(e) => saveChanges({ repository: e.target.value })}
              placeholder="https://github.com/user/repo"
              className="w-full bg-black/40 border border-white/10 text-sm focus:ring-1 focus:ring-accent rounded-lg px-3 py-2.5 text-foreground placeholder:text-white/20"
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
                    <td className="p-2"><input type="text" value={acc.platform} onChange={e => updateAccount(acc.id, 'platform', e.target.value)} placeholder="Supabase" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={acc.description} onChange={e => updateAccount(acc.id, 'description', e.target.value)} placeholder="Database Provider" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={acc.email} onChange={e => updateAccount(acc.id, 'email', e.target.value)} placeholder="admin@example.com" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={acc.password || ""} onChange={e => updateAccount(acc.id, 'password', e.target.value)} placeholder="••••••••" className="w-full bg-transparent border-none text-foreground font-mono focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
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
                    <td className="p-2"><input type="text" value={env.name} onChange={e => updateEnvironment(env.id, 'name', e.target.value)} placeholder="DATABASE_URL" className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={env.value} onChange={e => updateEnvironment(env.id, 'value', e.target.value)} placeholder="..." className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
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
                    <td className="p-2"><input type="text" value={seed.role} onChange={e => updateSeed(seed.id, 'role', e.target.value)} placeholder="Admin" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={seed.email} onChange={e => updateSeed(seed.id, 'email', e.target.value)} placeholder="admin@example.com" className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
                    <td className="p-2"><input type="text" value={seed.password || ""} onChange={e => updateSeed(seed.id, 'password', e.target.value)} placeholder="••••••••" className="w-full bg-transparent border-none text-foreground font-mono focus:ring-1 focus:ring-accent rounded px-2 py-1.5" /></td>
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
