"use client";

import { useState } from "react";
import { Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const COLORS = [
  { label: "Red", value: "bg-red-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Blue", value: "bg-blue-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Gray", value: "bg-gray-500" },
];

export function IssueSettings({ project, updateProject }: { project: Project; updateProject: (data: Partial<Project>) => Promise<void> }) {
  const [priorities, setPriorities] = useState(project.priorities || []);
  const [labels, setLabels] = useState(project.labels || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProject({ priorities, labels });
    setIsSaving(false);
  };

  const addPriority = () => {
    setPriorities([...priorities, { id: `p-${Math.random().toString(36).substr(2, 9)}`, name: "New Priority", color: "bg-gray-500", order: priorities.length }]);
  };



  return (
    <div className="space-y-10 animate-fade-in-up">
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Priority Levels</h2>
          <p className="text-sm text-foreground-muted mt-1">Configure issue priority levels available in this project.</p>
        </div>
        
        <div className="space-y-3">
          {priorities.map((priority, index) => (
            <div key={priority.id} className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
              <div className="flex-1">
                <input
                  type="text"
                  value={priority.name}
                  onChange={(e) => {
                    const newP = [...priorities];
                    newP[index].name = e.target.value;
                    setPriorities(newP);
                  }}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="w-32 shrink-0">
                <select
                  value={priority.color}
                  onChange={(e) => {
                    const newP = [...priorities];
                    newP[index].color = e.target.value;
                    setPriorities(newP);
                  }}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent appearance-none"
                >
                  {COLORS.map(c => <option key={c.value} value={c.value} className="bg-background-elevated text-white">{c.label}</option>)}
                </select>
              </div>
              <div className={`w-6 h-6 rounded-full shrink-0 ${priority.color}`}></div>
              <button onClick={() => setPriorities(priorities.filter(p => p.id !== priority.id))} className="text-error-muted hover:text-error p-1">
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={addPriority} className="gap-2 mt-2">
            <PlusIcon className="w-4 h-4" /> Add Priority
          </Button>
        </div>
      </div>

      

      <div className="flex items-center justify-end pt-4 border-t border-white/[0.05]">
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Issue Settings"}
        </Button>
      </div>
    </div>
  );
}
