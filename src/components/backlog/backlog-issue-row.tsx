"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Issue } from "@/store/issue-store";
import { useProjectStore } from "@/store/project-store";
import { format } from "date-fns";
import { 
  TrashIcon, 
  CalendarIcon, 
  Bars2Icon 
} from "@heroicons/react/24/outline";
import { DocumentTextIcon, BugAntIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@/components/ui/icon-button";
import type { SprintWithIssues } from "./backlog-board";

interface BacklogIssueRowProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: (issueId: string) => void;
  onClick: (issue: Issue) => void;
  onDelete: (e: React.MouseEvent, issue: Issue) => void;
  sprintsWithIssues: SprintWithIssues[]; // For the select dropdown options
  onMoveIssue: (issueId: string, targetSprintId: string) => void;
  parentLabel?: string;
}

const getStatusBadge = (status: string) => {
  if (!status) return null;
  switch (status.toLowerCase()) {
    case "todo": return <span className="bg-[#DFE1E6]/10 text-[#DFE1E6] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">TO DO ⌄</span>;
    case "in-progress":
    case "inprogress":
    case "in progress": return <span className="bg-[#0052CC]/30 text-[#4BADE8] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">IN PROGRESS ⌄</span>;
    case "in-review":
    case "in review":
    case "review": return <span className="bg-[#FF991F]/20 text-[#FF991F] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">IN REVIEW ⌄</span>;
    case "done": return <span className="bg-[#00875A]/20 text-[#57A55A] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">DONE ⌄</span>;
    case "cancelled": return <span className="bg-[#E5493A]/20 text-[#E5493A] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">CANCELLED ⌄</span>;
    default: return <span className="bg-white/10 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{status} ⌄</span>;
  }
};

export function BacklogIssueRow({ 
  issue, 
  isSelected, 
  onSelect, 
  onClick, 
  onDelete,
  sprintsWithIssues,
  onMoveIssue,
  parentLabel
}: BacklogIssueRowProps) {
  const project = useProjectStore(state => state.projects.find(p => p.id === issue.projectId));
  const issuePrefix = project?.issueNumberPrefix || "ISSUE-";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: issue.id,
    data: {
      type: "Issue",
      issue,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 py-1.5 px-2 ml-1 border border-transparent border-b-white/[0.06] hover:bg-white/[0.03] transition-colors group text-sm cursor-pointer ${isSelected ? "bg-accent/10" : ""}`}
      onClick={() => onClick(issue)}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/60 p-1 flex-shrink-0"
      >
        <Bars2Icon className="w-4 h-4" />
      </div>
      
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(issue.id)}
        onClick={(e) => e.stopPropagation()}
        className="w-3.5 h-3.5 rounded-sm border-white/30 bg-transparent accent-accent cursor-pointer flex-shrink-0"
      />
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
      
      <span className="text-foreground-muted font-medium text-xs w-10 flex-shrink-0">{issuePrefix}{String(issue.id).substring(0, 3)}</span>
      
      <span className="flex-1 text-[#DEE4EA] truncate hover:underline hover:text-accent transition-colors">{issue.title}</span>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        {issue.type === "epic" && (
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#403294]/30 text-[#9F8FEF] hidden md:block">EPIC</span>
        )}

        {parentLabel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-foreground-subtle hidden md:block truncate max-w-[120px]" title={parentLabel}>
            ↳ {parentLabel}
          </span>
        )}
        
        {getStatusBadge(issue.status)}
        
        {issue.dueDate && (
          <span className="flex items-center gap-1 text-xs text-foreground-muted w-16">
            <CalendarIcon className="w-3 h-3" />
            {format(new Date(issue.dueDate), "MMM d")}
          </span>
        )}
        
        <span className="text-foreground-muted text-xs font-medium bg-white/10 rounded-full w-5 h-5 flex items-center justify-center">-</span>
        
        {issue.estimate !== undefined && (
          <span className="flex items-center justify-center bg-white/[0.06] text-foreground-muted text-[11px] font-bold min-w-[20px] px-1.5 h-5 rounded-full" title="Estimate (Story Points)">
            {issue.estimate}
          </span>
        )}
        
        <div className="w-6 h-6 rounded-full bg-blue-600 border border-background flex items-center justify-center text-[10px] font-bold text-white">
          {issue.assignee ? issue.assignee.substring(0,1).toUpperCase() : "U"}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
           <select
             className="bg-transparent border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-foreground-muted hover:text-foreground focus:outline-none focus:border-accent w-24 cursor-pointer"
             onChange={(e) => { e.stopPropagation(); if (e.target.value) onMoveIssue(issue.id, e.target.value); }}
             onClick={(e) => e.stopPropagation()}
             value=""
           >
             <option value="" disabled>Move to...</option>
             <option value="backlog">Backlog</option>
             {sprintsWithIssues.filter(s => s.status === "Planned" || s.status === "Active").map(s => (
               <option key={s.id} value={s.id} className="bg-background-elevated">{s.name}</option>
             ))}
           </select>
           <IconButton variant="ghost" size="sm" icon={<TrashIcon className="w-3.5 h-3.5" />} className="text-foreground-muted hover:text-error w-6 h-6 p-0" onClick={(e) => onDelete(e, issue)} />
        </div>
      </div>
    </div>
  );
}
