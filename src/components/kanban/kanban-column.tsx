"use client";

import { useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus } from "@/store/task-store";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import { PlusIcon, ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(id === "failed");

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  return (
    <div 
      className={cn(
        "flex flex-col flex-shrink-0 border rounded-2xl overflow-hidden h-full transition-all duration-300",
        isCollapsed ? "w-12" : "w-80",
        id === "done" ? "bg-green-500/5 border-green-500/20" : id === "failed" ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.02] border-white/[0.05]"
      )}
    >
      {/* Column Header */}
      <div 
        className={cn(
          "p-4 border-b flex items-center justify-between",
          id === "done" ? "border-green-500/20 bg-green-500/10" : id === "failed" ? "border-red-500/20 bg-red-500/10" : "border-white/[0.05] bg-white/[0.01]",
          isCollapsed && "flex-col items-center justify-start p-2 gap-4 h-full border-b-0"
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold tracking-tight text-foreground">{title}</h3>
              <span className="flex items-center justify-center bg-white/[0.1] text-foreground-muted text-xs font-medium w-5 h-5 rounded-full">
                {tasks.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsCollapsed(true)}
                className="text-foreground-muted hover:text-foreground transition-colors p-1"
                title="Minimize Column"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {onAddTask && (
                <button 
                  onClick={() => onAddTask(id)}
                  className="text-foreground-muted hover:text-foreground transition-colors p-1"
                  title="Add Task"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsCollapsed(false)}
              className="text-foreground-muted hover:text-foreground transition-colors p-1"
              title="Expand Column"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
            <div className="[writing-mode:vertical-rl] rotate-180 flex items-center gap-2 mt-2">
              <span className="font-semibold tracking-tight text-foreground whitespace-nowrap">{title}</span>
              <span className="flex items-center justify-center bg-white/[0.1] text-foreground-muted text-xs font-medium w-5 h-5 rounded-full rotate-90">
                {tasks.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div 
          ref={setNodeRef}
          className={cn(
            "flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors",
            isOver ? "bg-white/[0.04]" : ""
          )}
        >
          <SortableContext items={tasks.map((t) => t.id)}>
            <div className="flex flex-col flex-1 min-h-[100px]">
              {tasks.map((task) => (
                <KanbanCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
              ))}
            </div>
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="h-24 border border-dashed border-white/[0.1] rounded-xl flex items-center justify-center text-sm text-foreground-muted">
              Drop tasks here
            </div>
          )}
        </div>
      )}
    </div>
  );
}
