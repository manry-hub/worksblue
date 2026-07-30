"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Issue } from "@/store/issue-store";
import { BacklogIssueRow } from "./backlog-issue-row";
import type { SprintWithIssues } from "./backlog-board";
import { PlusIcon } from "@heroicons/react/24/outline";

interface SprintListProps {
  id: string;
  issues: Issue[];
  selectedIssueIds: Set<string>;
  onToggleSelection: (issueId: string) => void;
  onClickIssue: (issue: Issue) => void;
  onDeleteIssue: (e: React.MouseEvent, issue: Issue) => void;
  sprintsWithIssues: SprintWithIssues[];
  onMoveIssue: (issueId: string, targetSprintId: string) => void;
  onCreateIssue: () => void;
  emptyMessage: string;
  getParentLabel?: (issue: Issue) => string | undefined;
}

export function SprintList({
  id,
  issues,
  selectedIssueIds,
  onToggleSelection,
  onClickIssue,
  onDeleteIssue,
  sprintsWithIssues,
  onMoveIssue,
  onCreateIssue,
  emptyMessage,
  getParentLabel
}: SprintListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: "Sprint", sprintId: id }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`mt-1 transition-colors ${isOver ? "bg-white/[0.02] rounded-md" : ""}`}
    >
      <SortableContext items={issues.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div className="min-h-[40px]">
          {issues.length === 0 ? (
            <div className="py-4 px-8 text-sm text-foreground-muted border border-white/[0.05] border-dashed rounded-md ml-6 mr-2">
              {emptyMessage}
            </div>
          ) : (
            issues.map(issue => (
              <BacklogIssueRow
                key={issue.id}
                issue={issue}
                isSelected={selectedIssueIds.has(issue.id)}
                onSelect={onToggleSelection}
                onClick={onClickIssue}
                onDelete={onDeleteIssue}
                sprintsWithIssues={sprintsWithIssues}
                onMoveIssue={onMoveIssue}
                parentLabel={getParentLabel?.(issue)}
              />
            ))
          )}
        </div>
      </SortableContext>
      <div 
        className="px-6 py-2 ml-6 mr-2 text-foreground-muted hover:bg-white/[0.03] cursor-pointer text-sm flex items-center gap-2 border border-transparent border-b-white/[0.06] rounded-b-md" 
        onClick={onCreateIssue}
      >
        <PlusIcon className="w-4 h-4" /> Create issue
      </div>
    </div>
  );
}
