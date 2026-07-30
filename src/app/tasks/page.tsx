"use client";

import { useEffect, useState } from "react";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { PlusIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useGlobalTaskStore } from "@/store/global-task-store";
import { TaskTree } from "@/components/tasks/task-tree";

export default function TasksPage() {
  const { tasks, isLoading, fetchTasks, addTask } = useGlobalTaskStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    fetchTasks().finally(() => setIsInitializing(false));
  }, [fetchTasks]);

  const handleAddRootTask = () => {
    addTask({
      parentId: null,
      name: "New Task",
      description: "",
      progress: 0,
      completed: false,
    });
  };

  const handleAddSubtask = (parentId: string) => {
    addTask({
      parentId,
      name: "New Subtask",
      description: "",
      progress: 0,
      completed: false,
    });
  };

  return (
    <WorkspaceShell>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/10 shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Global Tasks</h1>
            <p className="text-sm text-foreground-muted mt-1">Manage your personal and cross-project tasks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchTasks()}
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
              title="Refresh Tasks"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin text-accent' : ''}`} />
            </button>
            <button
              onClick={handleAddRootTask}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
            >
              <PlusIcon className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isInitializing ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-foreground-muted">
                <PlusIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">No tasks yet</h3>
              <p className="text-sm text-foreground-muted mb-4 max-w-sm">
                Get started by creating your first global task.
              </p>
              <button
                onClick={handleAddRootTask}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-foreground rounded-lg text-sm font-medium transition-colors"
              >
                Create Task
              </button>
            </div>
          ) : (
            <div className="min-w-[800px]">
              {/* Table Header */}
              <div className="flex items-center gap-4 py-3 px-4 border-b border-white/10 bg-white/[0.02] sticky top-0 z-10 text-xs font-semibold text-foreground-muted uppercase tracking-wider">
                <div className="w-5 shrink-0" /> {/* Expand toggle space */}
                <div className="w-5 shrink-0" /> {/* Checkbox space */}
                <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">Task Name</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Progress</div>
                  <div className="col-span-2">Start Date</div>
                  <div className="col-span-2">End Date</div>
                  <div className="col-span-1">Assignee</div>
                </div>
                <div className="w-24 shrink-0" /> {/* Actions space */}
              </div>

              {/* Task Tree */}
              <div className="pb-12">
                <TaskTree 
                  tasks={tasks} 
                  parentId={null} 
                  onAddSubtask={handleAddSubtask}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
