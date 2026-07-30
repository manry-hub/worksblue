"use client";

import { useState } from "react";
import { Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export function WorkflowSettings({ project, updateProject }: { project: Project; updateProject: (data: Partial<Project>) => Promise<void> }) {
  const [columns, setColumns] = useState(project.columns || []);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateProject({ columns });
    setIsSaving(false);
  };

  const handleAddColumn = () => {
    const newCol = {
      id: `col-${Math.random().toString(36).substr(2, 9)}`,
      title: "New Column",
      order: columns.length,
      wipLimit: null
    };
    setColumns([...columns, newCol]);
  };

  const handleDeleteColumn = (id: string) => {
    setColumns(columns.filter(c => c.id !== id).map((c, i) => ({ ...c, order: i })));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= columns.length) return;
    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[index + direction];
    newCols[index + direction] = temp;
    
    // Reassign order
    setColumns(newCols.map((c, i) => ({ ...c, order: i })));
  };

  const handleUpdate = (id: string, field: "title" | "wipLimit", value: string | number | null) => {
    setColumns(columns.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Workflow Configuration</h2>
        <p className="text-sm text-foreground-muted mt-1">Configure your Kanban columns and WIP (Work In Progress) limits.</p>
      </div>

      <div className="space-y-3">
        {columns.map((col, index) => (
          <div key={col.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
            <div className="flex flex-col gap-1">
              <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="text-foreground-muted hover:text-foreground disabled:opacity-30">
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button onClick={() => handleMove(index, 1)} disabled={index === columns.length - 1} className="text-foreground-muted hover:text-foreground disabled:opacity-30">
                <ChevronDownIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1">Column Name</label>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => handleUpdate(col.id, "title", e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground-muted mb-1">WIP Limit (optional)</label>
                <input
                  type="number"
                  min="1"
                  value={col.wipLimit === null ? "" : col.wipLimit}
                  onChange={(e) => handleUpdate(col.id, "wipLimit", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="∞"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button 
              onClick={() => handleDeleteColumn(col.id)}
              className="p-2 text-error-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
              title="Delete column"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.05]">
        <Button variant="secondary" onClick={handleAddColumn} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Add Column
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Workflow"}
        </Button>
      </div>
    </div>
  );
}
