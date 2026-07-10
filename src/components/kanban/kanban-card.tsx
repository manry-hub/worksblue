"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/store/task-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatBubbleLeftIcon, PaperClipIcon, CalendarIcon, TagIcon } from "@heroicons/react/24/outline";

interface KanbanCardProps {
  task: Task;
  onClick?: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityColor = {
    low: "neutral",
    medium: "warning",
    high: "error",
  } as const;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-accent border-dashed rounded-xl h-[120px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group relative cursor-grab active:cursor-grabbing mb-3"
      onClick={(e) => {
        // Prevent click if we are dragging
        if (!isDragging && onClick) {
          onClick();
        }
      }}
    >
      <Card className={cn(
        "p-4 hover:border-white/[0.2] transition-all",
        isDragging ? "shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-105 border-accent/50" : ""
      )}>
        <div className="flex justify-between items-start mb-2">
          <Badge variant={priorityColor[task.priority]}>{task.priority}</Badge>
          <div className="flex -space-x-2">
            {(() => {
               const isMe = !task.assignee || task.assignee.toLowerCase() === "hilman";
               const displayString = task.assignee || "hilman";
               return (
                 <div 
                   className={cn(
                     "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-background-base",
                     isMe ? "bg-accent/20 text-accent-bright" : "bg-warning/20 text-warning"
                   )} 
                   title={`Assignee: ${displayString}`}
                 >
                   {displayString.charAt(0).toUpperCase()}
                 </div>
               );
            })()}
          </div>
        </div>
        
        <h4 className="text-sm font-medium mb-1 line-clamp-2">{task.title}</h4>
        
        {task.description && (
          <p className="text-xs text-foreground-muted line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        {(task.labels && task.labels.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((l, i) => (
              <span key={`${l}-${i}`} className="text-[10px] bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded text-foreground-subtle flex items-center gap-1">
                <TagIcon className="w-2.5 h-2.5" /> {l}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-foreground-subtle mt-3 pt-3 border-t border-white/[0.06]">
          
          
          <span className="ml-auto">
            {task.dueDate && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-warning" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
            {/* {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} */}
          </span>
        </div>
      </Card>
    </div>
  );
}
