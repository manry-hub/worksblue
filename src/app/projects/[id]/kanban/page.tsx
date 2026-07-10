"use client";

import { use, useState } from "react";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateTaskModal } from "@/components/kanban/create-task-modal";
import { TaskDetailsModal } from "@/components/kanban/task-details-modal";
import { TaskStatus, type Task } from "@/store/task-store";
import { Button } from "@/components/ui/button";
import { PlusIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export default function KanbanPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<TaskStatus>("todo");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<"all" | "hilman" | "others">("all");

  const handleOpenCreateModal = (status: TaskStatus = "todo") => {
    setCreateModalStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Kanban Board</h2>
          <p className="text-foreground-muted mt-1">Manage and track your project tasks visually.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterAssignee === "all" ? "bg-white/10 text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"}`}
              onClick={() => setFilterAssignee("all")}
            >
              All
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterAssignee === "hilman" ? "bg-white/10 text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"}`}
              onClick={() => setFilterAssignee("hilman")}
            >
              Hilman
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterAssignee === "others" ? "bg-white/10 text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"}`}
              onClick={() => setFilterAssignee("others")}
            >
              Others
            </button>
          </div>
          <Button variant="primary" icon={<PlusIcon />} onClick={() => handleOpenCreateModal("todo")}>
            New Task
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard projectId={params.id} onAddTask={handleOpenCreateModal} onTaskClick={(task) => setSelectedTask(task)} filterAssignee={filterAssignee} />
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        projectId={params.id} 
        initialStatus={createModalStatus} 
      />

      <TaskDetailsModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        projectId={params.id}
        task={selectedTask}
      />
    </div>
  );
}
