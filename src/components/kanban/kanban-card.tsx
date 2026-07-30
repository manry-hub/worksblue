"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "@/store/issue-store";
import { useProjectStore } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CalendarIcon, TagIcon, ArrowUpIcon, Bars2Icon, ChevronDoubleDownIcon, QueueListIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon, BugAntIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

interface KanbanCardProps {
  issue: Issue;
  onClick?: () => void;
}

export function KanbanCard({ issue, onClick }: KanbanCardProps) {
  const project = useProjectStore(state => state.projects.find(p => p.id === issue.projectId));
  
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: {
      type: "Issue",
      issue,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorities = project?.priorities || [
    { id: "low", name: "Low", color: "bg-green-500", order: 3 },
    { id: "medium", name: "Medium", color: "bg-yellow-500", order: 2 },
    { id: "high", name: "High", color: "bg-red-500", order: 1 }
  ];
  const issuePrefix = project?.issueNumberPrefix || "ISSUE-";

  const currentPriority = priorities.find(p => p.id === issue.priority) || priorities[1];

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
      onClick={() => {
        // Prevent click if we are dragging
        if (!isDragging && onClick) {
          onClick();
        }
      }}
    >
      <Card className={cn(
        "p-3 rounded-md border border-white/[0.08] hover:bg-white/[0.03] bg-[#22272B] transition-all",
        isDragging ? "shadow-[0_8px_24px_rgba(0,0,0,0.5)] rotate-2 scale-105 border-accent/50" : ""
      )}>
        {issue.type === "epic" && (
          <div className="mb-1.5">
             <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#403294]/30 text-[#9F8FEF]">EPIC</span>
          </div>
        )}

        <h4 className="text-[13px] text-[#DEE4EA] font-medium leading-5 mb-3">{issue.title}</h4>
        
        {(issue.labels && issue.labels.length > 0) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {issue.labels.map((l, i) => {
              const labelConfig = project?.labels?.find(label => label.name.toLowerCase() === l.toLowerCase());
              return (
                <span key={`${l}-${i}`} className="text-[10px] bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded text-foreground-subtle flex items-center gap-1">
                  {labelConfig && <div className={`w-1.5 h-1.5 rounded-full ${labelConfig.color}`}></div>}
                  {l}
                </span>
              );
            })}
          </div>
        )}
        
        {issue.checklist && issue.checklist.length > 0 && (
          <div className="flex items-center gap-1 mb-3 text-foreground-subtle text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded w-fit">
            <QueueListIcon className="w-3 h-3" />
            {issue.checklist.filter(c => c.completed).length}/{issue.checklist.length}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {(() => {
              switch (issue.type) {
                case "bug":
                  return <div className="w-4 h-4 rounded-[3px] bg-[#E5493A] flex items-center justify-center flex-shrink-0 text-white"><BugAntIcon className="w-3 h-3" /></div>;
                case "story":
                  return <div className="w-4 h-4 rounded-[3px] bg-[#57A55A] flex items-center justify-center flex-shrink-0 text-white"><DocumentTextIcon className="w-3 h-3" /></div>;
                case "epic":
                  return <div className="w-4 h-4 rounded-[3px] bg-[#403294] flex items-center justify-center flex-shrink-0 text-white"><DocumentTextIcon className="w-3 h-3" /></div>;
                default: // task
                  return <div className="w-4 h-4 rounded-[3px] bg-[#4BADE8] flex items-center justify-center flex-shrink-0 text-white"><CheckBadgeIcon className="w-3 h-3" /></div>;
              }
            })()}
            
            {/* Issue ID */}
            <span className="text-xs font-medium text-foreground-muted">
              {String(issue.id).startsWith("issue-") 
                ? `${issuePrefix}${String(issue.id).substring(6, 9)}`
                : issue.id}
            </span>
            
            {/* Priority */}
            {currentPriority && (
               <div className={`w-2 h-2 rounded-full ${currentPriority.color}`} title={`Priority: ${currentPriority.name}`}></div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {issue.estimate !== undefined && (
              <span className="flex items-center justify-center bg-white/[0.06] text-foreground-muted text-[11px] font-bold min-w-[20px] px-1 h-5 rounded-full" title="Estimate (Story Points)">
                {issue.estimate}
              </span>
            )}
            {(() => {
               const displayString = issue.assignee || "hilman";
               return (
                 <div 
                   className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white border border-background" 
                   title={`Assignee: ${displayString}`}
                 >
                   {displayString.charAt(0).toUpperCase()}
                 </div>
               );
            })()}
          </div>
        </div>
      </Card>
    </div>
  );
}
