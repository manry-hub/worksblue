"use client";

import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, ServerIcon, FolderPlusIcon } from "@heroicons/react/24/outline";

type ApiDesignReq = NonNullable<NonNullable<Project['design']>['apiDesign']>[0];

export function ApiDesignTable({ projectId }: { projectId: string }) {
  const { getProject, updateProject } = useProjectStore();
  const project = getProject(projectId);

  if (!project) return null;

  const apiDesignGroups = project.design?.apiDesignGroups || [];
  const apiDesign = project.design?.apiDesign || [];

  const saveChanges = async (updates: Partial<NonNullable<Project['design']>>) => {
    const currentDesign = project.design || {};
    await updateProject(projectId, { design: { ...currentDesign, ...updates } });
  };

  const addGroup = () => {
    const nextCharCode = apiDesignGroups.length > 0 
      ? apiDesignGroups[apiDesignGroups.length - 1].id.charCodeAt(0) + 1 
      : 65; // 'A'
    const newGroupId = String.fromCharCode(nextCharCode);
    const updated = [...apiDesignGroups, { id: newGroupId, name: `Service ${newGroupId}` }];
    saveChanges({ apiDesignGroups: updated });
  };

  const updateGroupName = (groupId: string, name: string) => {
    const updated = apiDesignGroups.map(g => g.id === groupId ? { ...g, name } : g);
    saveChanges({ apiDesignGroups: updated });
  };

  const removeGroup = (groupId: string) => {
    if (!confirm("Are you sure you want to remove this module and all its endpoints?")) return;
    const updatedGroups = apiDesignGroups.filter(g => g.id !== groupId);
    const updatedApi = apiDesign.filter(r => r.groupId !== groupId);
    saveChanges({ apiDesignGroups: updatedGroups, apiDesign: updatedApi });
  };

  const addEndpoint = (groupId?: string) => {
    const newId = `API-${Date.now().toString().substring(5)}`;
    const newReq: ApiDesignReq = { 
      id: newId, 
      groupId, 
      verb: "GET",
      path: "",
      action: "",
      usedFor: ""
    };
    const updated = [...apiDesign, newReq];
    saveChanges({ apiDesign: updated });
  };

  const updateEndpoint = <K extends keyof ApiDesignReq>(id: string, field: K, value: ApiDesignReq[K]) => {
    const updated = apiDesign.map(req => req.id === id ? { ...req, [field]: value } : req);
    saveChanges({ apiDesign: updated });
  };

  const removeEndpoint = (id: string) => {
    const updated = apiDesign.filter(r => r.id !== id);
    saveChanges({ apiDesign: updated });
  };

  const renderVerbBadge = (verb: string) => {
    const colors: Record<string, string> = {
      GET: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      POST: "text-green-400 bg-green-400/10 border-green-400/20",
      PUT: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      PATCH: "text-orange-400 bg-orange-400/10 border-orange-400/20",
      DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
    };
    return colors[verb] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
  };

  const renderTable = (groupId?: string) => {
    const items = apiDesign.filter(r => r.groupId === groupId);
    if (items.length === 0 && !groupId) return null;

    return (
      <div className="overflow-x-auto rounded-lg border border-white/5 mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
            <tr>
              <th className="px-4 py-3 font-medium w-32">Verb</th>
              <th className="px-4 py-3 font-medium w-1/4">Path</th>
              <th className="px-4 py-3 font-medium w-1/4">Action</th>
              <th className="px-4 py-3 font-medium">Used For</th>
              <th className="px-4 py-3 font-medium w-16 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <td className="p-2">
                  <select
                    value={item.verb}
                    onChange={(e) => updateEndpoint(item.id, 'verb', e.target.value as ApiDesignReq['verb'])}
                    className={`w-full bg-transparent border border-transparent hover:border-white/10 rounded px-2 py-1.5 focus:ring-1 focus:ring-accent text-xs font-mono font-medium ${renderVerbBadge(item.verb).split(" ")[0]}`}
                  >
                    <option value="GET" className="bg-[#1e1e1e] text-foreground">GET</option>
                    <option value="POST" className="bg-[#1e1e1e] text-foreground">POST</option>
                    <option value="PUT" className="bg-[#1e1e1e] text-foreground">PUT</option>
                    <option value="PATCH" className="bg-[#1e1e1e] text-foreground">PATCH</option>
                    <option value="DELETE" className="bg-[#1e1e1e] text-foreground">DELETE</option>
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.path}
                    onChange={(e) => updateEndpoint(item.id, 'path', e.target.value)}
                    placeholder="/api/v1/..."
                    className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.action}
                    onChange={(e) => updateEndpoint(item.id, 'action', e.target.value)}
                    placeholder="e.g. Create new user"
                    className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.usedFor}
                    onChange={(e) => updateEndpoint(item.id, 'usedFor', e.target.value)}
                    placeholder="e.g. User registration form"
                    className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                  />
                </td>
                <td className="p-2 text-center">
                  <button 
                    onClick={() => removeEndpoint(item.id)}
                    className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && groupId && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">
                  No endpoints added to this module yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-2 bg-white/[0.02] border-t border-white/5">
          <Button variant="ghost" size="sm" onClick={() => addEndpoint(groupId)} className="w-full text-xs text-foreground-muted hover:text-foreground">
            <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
            Add Endpoint
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
            <ServerIcon className="w-5 h-5 text-orange-400" />
            API Design
          </h3>
          <p className="text-sm text-foreground-muted mt-1">Design RESTful API endpoints and methods.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={addGroup} className="gap-2">
          <FolderPlusIcon className="w-4 h-4" />
          Add Module
        </Button>
      </div>
      
      <div className="p-6 space-y-8 bg-black/10">
        {/* Grouped Endpoints */}
        {apiDesignGroups.map(group => (
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
        
        {apiDesignGroups.length === 0 && (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-lg">
            <p className="text-foreground-muted mb-4">No modules defined.</p>
            <Button variant="secondary" onClick={addGroup} className="gap-2 mx-auto">
              <FolderPlusIcon className="w-4 h-4" />
              Add Module
            </Button>
          </div>
        )}

        {/* Ungrouped Endpoints */}
        {apiDesign.filter(r => !r.groupId).length > 0 && (
          <div className="pt-6 border-t border-white/5">
            <h4 className="text-sm font-medium text-foreground-muted mb-3 flex items-center gap-2">
              Ungrouped Endpoints
            </h4>
            {renderTable(undefined)}
          </div>
        )}
      </div>
    </Card>
  );
}
