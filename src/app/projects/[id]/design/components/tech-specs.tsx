"use client";

import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, CpuChipIcon } from "@heroicons/react/24/outline";

type TechSpec = NonNullable<NonNullable<Project['design']>['techSpecs']>[0];

export function TechSpecsTable({ projectId }: { projectId: string }) {
  const { getProject, updateProject } = useProjectStore();
  const project = getProject(projectId);

  if (!project) return null;

  const techSpecs = project.design?.techSpecs || [];

  const saveChanges = async (updates: Partial<NonNullable<Project['design']>>) => {
    const currentDesign = project.design || {};
    await updateProject(projectId, { design: { ...currentDesign, ...updates } });
  };

  const addTechSpec = () => {
    const newId = `TS-${Date.now().toString().substring(5)}`;
    const newSpec: TechSpec = { 
      id: newId, 
      need: "",
      name: "",
      version: ""
    };
    const updated = [...techSpecs, newSpec];
    saveChanges({ techSpecs: updated });
  };

  const updateSpec = <K extends keyof TechSpec>(id: string, field: K, value: TechSpec[K]) => {
    const updated = techSpecs.map(spec => spec.id === id ? { ...spec, [field]: value } : spec);
    saveChanges({ techSpecs: updated });
  };

  const removeSpec = (id: string) => {
    const updated = techSpecs.filter(t => t.id !== id);
    saveChanges({ techSpecs: updated });
  };

  return (
    <Card className="bg-background-elevated/40 backdrop-blur-sm border-white/5 overflow-hidden flex flex-col mt-6">
      <div className="p-5 border-b border-white/5 bg-white/[0.01]">
        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
          <CpuChipIcon className="w-5 h-5 text-blue-400" />
          Technology Specification
        </h3>
        <p className="text-sm text-foreground-muted mt-1">Specify technologies, frameworks, and tools required for implementation.</p>
      </div>
      
      <div className="p-6 bg-black/10">
        <div className="overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-foreground-muted border-b border-white/5">
              <tr>
                <th className="px-4 py-3 font-medium w-1/3">Need </th>
                <th className="px-4 py-3 font-medium w-1/3">Name </th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {techSpecs.map(item => (
                <tr key={item.id} className="bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.need}
                      onChange={(e) => updateSpec(item.id, 'need', e.target.value)}
                      className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateSpec(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-none text-foreground focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.version}
                      onChange={(e) => updateSpec(item.id, 'version', e.target.value)}
                      className="w-full bg-transparent border-none text-foreground font-mono text-xs focus:ring-1 focus:ring-accent rounded px-2 py-1.5"
                    />
                  </td>
                  <td className="p-2 text-center">
                    <button 
                      onClick={() => removeSpec(item.id)}
                      className="text-foreground-muted hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {techSpecs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-foreground-muted/50 text-sm">
                    No technology specifications added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-2 bg-white/[0.02] border-t border-white/5">
            <Button variant="ghost" size="sm" onClick={addTechSpec} className="w-full text-xs text-foreground-muted hover:text-foreground">
              <PlusIcon className="w-3.5 h-3.5 mr-1.5" />
              Add Technology
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
