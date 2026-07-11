"use client";

import { useEffect, useState, use } from "react";
import { useTaskStore, type Task } from "@/store/task-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ClipboardDocumentCheckIcon, EllipsisHorizontalIcon, RocketLaunchIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { TaskDetailsModal } from "@/components/kanban/task-details-modal";

export default function BacklogPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { tasks, fetchTasks, updateTask, deleteTask, isLoading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState<"all" | "hilman" | "others">("all");
  
  useEffect(() => {
    fetchTasks(projectId);
  }, [fetchTasks, projectId]);

  const backlogTasks = tasks.filter(t => {
    if (t.status !== "backlog") return false;
    
    const assignee = (t.assignee || "hilman").toLowerCase();
    if (filterAssignee === "hilman" && assignee !== "hilman") return false;
    if (filterAssignee === "others" && assignee === "hilman") return false;
    
    return true;
  });

  const sendToBoard = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    await updateTask(projectId, task.id, { status: "todo" });
  };

  const handleDelete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(projectId, task.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Backlog</h2>
          <p className="text-foreground-muted text-sm mt-1">
            Unscheduled tasks, ideas, and issues waiting to be prioritized.
          </p>
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
          <Button variant="primary" icon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
            Create Task
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {backlogTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-4">
              <ClipboardDocumentCheckIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium">Your backlog is empty</h3>
            <p className="text-foreground-muted mt-2 max-w-sm">
              Great job! All your tasks are either on the board or completed. Add new ideas here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {backlogTasks.map(task => (
              <div 
                key={task.id} 
                className="p-4 flex items-center gap-4 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                    {task.priority === "high" && <Badge variant="error">High</Badge>}
                    {task.priority === "medium" && <Badge variant="warning">Med</Badge>}
                    {task.priority === "low" && <Badge variant="success">Low</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span>{task.id}</span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        • Due {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex items-center gap-1">
                        • {task.labels.map((l, i) => (
                          <span key={`${l}-${i}`} className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {(() => {
                    const isMe = !task.assignee || task.assignee.toLowerCase() === "hilman";
                    const displayString = task.assignee || "hilman";
                    return (
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-background-base ${isMe ? "bg-accent/20 text-accent-bright" : "bg-warning/20 text-warning"}`} 
                        title={`Assignee: ${displayString}`}
                      >
                        {displayString.charAt(0).toUpperCase()}
                      </div>
                    );
                  })()}
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={<RocketLaunchIcon className="w-4 h-4" />}
                      onClick={(e) => sendToBoard(e, task)}
                    >
                      Send to Board
                    </Button>
                    <IconButton 
                      variant="ghost" 
                      size="sm" 
                      icon={<TrashIcon />} 
                      className="text-foreground-muted hover:text-error"
                      onClick={(e) => handleDelete(e, task)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <TaskDetailsModal 
        isOpen={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projectId={projectId}
        mode="edit"
      />
      
      <TaskDetailsModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        task={null}
        projectId={projectId}
        mode="create"
      />
    </div>
  );
}
