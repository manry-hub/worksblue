"use client";

import { useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Issue, IssueStatus } from "@/store/issue-store";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import { PlusIcon, ChevronRightIcon, ChevronLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ColumnConfig } from "@/types/sprint";

interface KanbanColumnProps {
  column: ColumnConfig;
  issues: Issue[];
  onAddIssue?: (status: IssueStatus) => void;
  onIssueClick?: (issue: Issue) => void;
}

export function KanbanColumn({ column, issues, onAddIssue, onIssueClick }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(column.id === "failed");

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      status: column.id,
    },
  });

  const isOverWipLimit = column.wipLimit && column.wipLimit > 0 && issues.length >= column.wipLimit;

  return (
    <div 
      className={cn(
        "flex flex-col flex-shrink-0 rounded-md overflow-hidden h-full transition-all duration-300 bg-[#161A1D]",
        isCollapsed ? "w-12" : "w-80"
      )}
    >
      {/* Column Header */}
      <div 
        className={cn(
          "px-3 py-2 flex items-center justify-between sticky top-0 z-10 bg-[#161A1D]",
          isCollapsed && "flex-col items-center justify-start p-2 gap-4 h-full"
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">{column.title}</h3>
              <div className="flex items-center gap-1">
                <span className="flex items-center justify-center bg-white/[0.06] text-foreground-muted text-[11px] font-bold px-1.5 min-w-[20px] h-5 rounded-full">
                  {issues.length}
                </span>
                {column.wipLimit && column.wipLimit > 0 && (
                  <span className={cn(
                    "flex items-center justify-center text-[11px] font-bold px-1.5 min-w-[20px] h-5 rounded-full",
                    isOverWipLimit ? "bg-error/20 text-error" : "bg-white/[0.06] text-foreground-muted"
                  )}>
                    {column.wipLimit}
                  </span>
                )}
              </div>
              {isOverWipLimit && (
                <span className="flex items-center gap-1 text-error text-xs font-medium px-2 py-0.5 bg-error/10 rounded">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  WIP Limit Reached
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsCollapsed(true)}
                className="text-foreground-muted hover:text-foreground transition-colors p-1"
                title="Minimize Column"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              {onAddIssue && (
                <button 
                  onClick={() => onAddIssue(column.id)}
                  className="text-foreground-muted hover:text-foreground transition-colors p-1"
                  title="Add Issue"
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
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted whitespace-nowrap">{column.title}</span>
              <span className="flex items-center justify-center bg-white/[0.06] text-foreground-muted text-[11px] font-bold px-1.5 min-w-[20px] h-5 rounded-full rotate-90">
                {issues.length}
                {column.wipLimit && column.wipLimit > 0 && <span>/</span>}
                {column.wipLimit && column.wipLimit > 0 && <span>{column.wipLimit}</span>}
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
            "flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors custom-scrollbar",
            isOver ? "bg-white/[0.03]" : ""
          )}
        >
          <SortableContext items={issues.map((i) => i.id)}>
            <div className="flex flex-col flex-1 min-h-[100px]">
              {issues.map((issue) => (
                <KanbanCard key={issue.id} issue={issue} onClick={() => onIssueClick?.(issue)} />
              ))}
            </div>
          </SortableContext>
          
          {issues.length === 0 && (
            <div className="h-24 border border-dashed border-white/[0.1] rounded-xl flex items-center justify-center text-sm text-foreground-muted">
              Drop issues here
            </div>
          )}
        </div>
      )}
    </div>
  );
}