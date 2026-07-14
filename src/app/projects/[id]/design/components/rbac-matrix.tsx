"use client";

import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, ShieldCheckIcon, FolderPlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type RbacReq = NonNullable<NonNullable<Project['design']>['rbac']>[0];

export function RbacMatrix({ projectId }: { projectId: string }) {
  const { getProject, updateProject } = useProjectStore();
  const project = getProject(projectId);

  if (!project) return null;

  const stakeholders = project.stakeholders || [];
  const rbacGroups = project.design?.rbacGroups || [];
  const rbac = project.design?.rbac || [];

  const saveChanges = async (updates: Partial<NonNullable<Project['design']>>) => {
    const currentDesign = project.design || {};
    await updateProject(projectId, { design: { ...currentDesign, ...updates } });
  };

  const addGroup = () => {
    const nextCharCode = rbacGroups.length > 0 
      ? rbacGroups[rbacGroups.length - 1].id.charCodeAt(0) + 1 
      : 65; // 'A'
    const newGroupId = String.fromCharCode(nextCharCode);
    const updated = [...rbacGroups, { id: newGroupId, name: `Module ${newGroupId}` }];
    saveChanges({ rbacGroups: updated });
  };

  const updateGroupName = (groupId: string, name: string) => {
    const updated = rbacGroups.map(g => g.id === groupId ? { ...g, name } : g);
    saveChanges({ rbacGroups: updated });
  };

  const removeGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this module and all its permissions?")) return;
    const updatedGroups = rbacGroups.filter(g => g.id !== groupId);
    const updatedRbac = rbac.filter(r => r.groupId !== groupId);
    saveChanges({ rbacGroups: updatedGroups, rbac: updatedRbac });
  };

  const addPermission = (groupId?: string) => {
    const newId = `RBAC-${Date.now().toString().substring(5)}`;
    const newReq: RbacReq = { 
      id: newId, 
      groupId, 
      permission: "",
      roles: {}
    };
    const updated = [...rbac, newReq];
    saveChanges({ rbac: updated });
  };

  const updatePermission = (id: string, field: 'permission', value: string) => {
    const updated = rbac.map(req => req.id === id ? { ...req, [field]: value } : req);
    saveChanges({ rbac: updated });
  };

  const updateRole = (id: string, role: string, value: boolean) => {
    const updated = rbac.map(req => {
      if (req.id === id) {
        return { ...req, roles: { ...(req.roles || {}), [role]: value } };
      }
      return req;
    });
    saveChanges({ rbac: updated });
  };

  const removePermission = (id: string) => {
    const updated = rbac.filter(r => r.id !== id);
    saveChanges({ rbac: updated });
  };

  const renderTable = (groupId?: string) => {
    const items = rbac.filter(r => r.groupId === groupId);
    if (items.length === 0 && !groupId) return null;

    if (stakeholders.length === 0) {
      return (
        <div className="mt-4 p-4 border border-dashed border-white/10 rounded-lg text-center text-sm text-foreground-muted">
          No stakeholders defined. Please add stakeholders in the <Link href={`/projects/${projectId}/planning`} className="text-accent hover:underline">Planning phase</Link> to assign roles.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-white/5 mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
            <tr>
              <th className="px-4 py-3 font-medium w-1/3">Permission</th>
              {stakeholders.map(stakeholder => (
                <th key={stakeholder} className="px-4 py-3 font-medium text-center">{stakeholder}</th>
              ))}
              <th className="px-4 py-3 font-medium w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <td className="p-2">
                  <input
                    type="text"
                    value={item.permission}
                    onChange={(e) => updatePermission(item.id, 'permission', e.target.value)}
                    placeholder="e.g. Create Task"
                    className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                  />
                </td>
                {stakeholders.map(stakeholder => {
                  const hasAccess = item.roles?.[stakeholder] || false;
                  return (
                    <td key={stakeholder} className="p-2 text-center">
                      <button
                        onClick={() => updateRole(item.id, stakeholder, !hasAccess)}
                        className={`w-6 h-6 mx-auto rounded flex items-center justify-center transition-colors ${
                          hasAccess ? 'bg-accent/20 text-accent' : 'bg-white/5 text-transparent hover:bg-white/10'
                        }`}
                      >
                        {hasAccess && <CheckIcon className="w-4 h-4" />}
                      </button>
                    </td>
                  );
                })}
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removePermission(item.id)}
                    className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && groupId && (
              <tr>
                <td colSpan={stakeholders.length + 2} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">
                  No permissions added to this module yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-2 bg-white/[0.02] border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={() => addPermission(groupId)} className="w-full text-xs text-foreground-muted hover:text-foreground">
            <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
            Add Permission
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col mt-6">
      <div className="p-5 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-green-400" />
            RBAC Matrix
          </h3>
          <p className="text-sm text-foreground-muted mt-1">Role-Based Access Control matrix.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={addGroup} className="gap-2">
          <FolderPlusIcon className="w-4 h-4" />
          Add Module
        </Button>
      </div>
      
      <div className="p-6 space-y-8 bg-black/10">
        {/* Grouped Permissions */}
        {rbacGroups.map(group => (
          <div key={group.id} className="space-y-3">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 flex-1">
                <div className="px-2 py-1 bg-white/10 text-foreground-muted text-xs font-mono rounded">
                  Module: {group.id}
                </div>
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className="bg-transparent border-none text-foreground font-medium focus:ring-1 focus:ring-accent rounded px-2 py-1 w-full max-w-sm"
                  placeholder="Module Name"
                />
              </div>
              <button
                onClick={() => removeGroup(group.id)}
                className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-red-400 p-2 transition-all"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            
            {renderTable(group.id)}
          </div>
        ))}
        
        {rbacGroups.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-muted mb-4">No modules defined.</p>
            <Button variant="secondary" onClick={addGroup} className="gap-2 mx-auto">
              <FolderPlusIcon className="w-4 h-4" />
              Add Module
            </Button>
          </div>
        )}

        {/* Ungrouped Permissions */}
        {rbac.filter(r => !r.groupId).length > 0 && (
          <div className="pt-6 border-t border-white/5">
            <h4 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
              Ungrouped Permissions
            </h4>
            {renderTable(undefined)}
          </div>
        )}
      </div>
    </Card>
  );
}
