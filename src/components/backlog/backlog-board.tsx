"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Issue } from "@/store/issue-store";
import { SprintStatus } from "@/types/sprint";
import { SprintList } from "./sprint-list";
import { BacklogIssueRow } from "./backlog-issue-row";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { ChevronDownIcon, ChevronRightIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

export interface SprintWithIssues {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate?: string;
  endDate?: string;
  issues: Issue[];
  createdAt: string;
}

interface BacklogBoardProps {
  sprintsWithIssues: SprintWithIssues[];
  filteredBacklogIssues: Issue[];
  allIssues: Issue[];
  expandedSprints: Set<string>;
  toggleSprintExpanded: (sprintId: string) => void;
  selectedIssueIds: Set<string>;
  toggleIssueSelection: (issueId: string) => void;
  setSelectedIssue: (issue: Issue) => void;
  handleDeleteIssue: (e: React.MouseEvent, issue: Issue) => void;
  handleMoveIssue: (issueId: string, targetSprintId: string) => void;
  setIsCreateIssueModalOpen: (val: boolean) => void;
  setIsCreateSprintModalOpen: (val: boolean) => void;
  handleStartSprint: (sprintId: string) => void;
  handleCompleteSprint: (sprintId: string) => void;
  handleEditSprint: (sprint: SprintWithIssues) => void;
  handleDeleteSprint: (sprintId: string) => void;
  onDragEnd: (issueId: string, targetSprintId: string | null) => Promise<void>;
}

export function BacklogBoard({
  sprintsWithIssues,
  filteredBacklogIssues,
  allIssues,
  expandedSprints,
  toggleSprintExpanded,
  selectedIssueIds,
  toggleIssueSelection,
  setSelectedIssue,
  handleDeleteIssue,
  handleMoveIssue,
  setIsCreateIssueModalOpen,
  setIsCreateSprintModalOpen,
  handleStartSprint,
  handleCompleteSprint,
  handleEditSprint,
  handleDeleteSprint,
  onDragEnd
}: BacklogBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getParentLabel = (issue: Issue): string | undefined => {
    if (!issue.parentId) return undefined;
    const parent = allIssues.find(i => i.id === issue.parentId);
    if (!parent) return undefined;
    const typeLabel = parent.type.charAt(0).toUpperCase() + parent.type.slice(1);
    return `${typeLabel}: ${parent.title}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = [...filteredBacklogIssues, ...sprintsWithIssues.flatMap(s => s.issues)].find(i => i.id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const activeIssueId = active.id as string;
    
    // Find where we dropped it. over.id could be a SprintId ("backlog" or actual sprint ID) 
    // or it could be an IssueId. If it's an issue ID, we find its parent sprint.
    let targetSprintId: string | null = null;
    
    const overId = over.id as string;
    
    if (overId === "backlog") {
      targetSprintId = null;
    } else if (sprintsWithIssues.find(s => s.id === overId)) {
      targetSprintId = overId;
    } else {
      // Check if dropped over an issue
      const overIssue = [...filteredBacklogIssues, ...sprintsWithIssues.flatMap(s => s.issues)].find(i => i.id === overId);
      if (overIssue) {
        targetSprintId = overIssue.sprintId || null;
      }
    }
    
    const currentIssue = [...filteredBacklogIssues, ...sprintsWithIssues.flatMap(s => s.issues)].find(i => i.id === activeIssueId);
    if (currentIssue && currentIssue.sprintId !== targetSprintId) {
       await onDragEnd(activeIssueId, targetSprintId);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {sprintsWithIssues.map(sprint => {
          const isExpanded = expandedSprints.has(sprint.id);
          const completedCount = sprint.issues.filter(i => i.status === "done").length;
          const totalCount = sprint.issues.length;
          const activeCount = totalCount - completedCount;

          return (
            <div key={sprint.id} className="mb-8">
              {/* Sprint Header */}
              <div 
                className="group flex items-center justify-between px-2 py-1.5 transition-colors cursor-pointer rounded-t-md hover:bg-white/[0.03]"
                onClick={() => toggleSprintExpanded(sprint.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    className="p-0.5 text-foreground-muted hover:text-foreground transition-colors flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); toggleSprintExpanded(sprint.id); }}
                  >
                    {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                  </button>
                  <h3 className="font-semibold text-[15px] text-[#DEE4EA] flex items-center gap-3">
                    {sprint.name} 
                    <span className="text-xs text-foreground-muted font-normal">
                      {sprint.startDate ? format(new Date(sprint.startDate), "d MMM") : ""} 
                      {sprint.startDate && sprint.endDate ? " - " : ""} 
                      {sprint.endDate ? format(new Date(sprint.endDate), "d MMM") : ""}
                    </span>
                    <span className="text-xs text-foreground-muted font-normal">({totalCount} issues)</span>
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                   <div className="flex items-center text-xs font-medium border border-white/10 rounded overflow-hidden">
                     <span className="bg-[#DFE1E6]/10 text-[#DFE1E6] px-2 py-0.5">{totalCount}</span>
                     <span className="bg-[#0052CC]/20 text-[#4BADE8] px-2 py-0.5 border-l border-white/10">{activeCount}</span>
                     <span className="bg-[#00875A]/20 text-[#57A55A] px-2 py-0.5 border-l border-white/10">{completedCount}</span>
                   </div>
                   {sprint.status === "Planned" && (
                     <Button variant="secondary" size="sm" className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 text-[#DEE4EA]" onClick={(e) => { e.stopPropagation(); handleStartSprint(sprint.id); }}>
                       Start sprint
                     </Button>
                   )}
                   {sprint.status === "Active" && (
                     <Button variant="secondary" size="sm" className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 text-[#DEE4EA]" onClick={(e) => { e.stopPropagation(); handleCompleteSprint(sprint.id); }}>
                       Complete sprint
                     </Button>
                   )}
                   <IconButton variant="ghost" size="sm" icon={<PencilIcon className="w-4 h-4 text-foreground-muted hover:text-[#DEE4EA]" />} onClick={(e) => { e.stopPropagation(); handleEditSprint(sprint); }} />
                   <IconButton variant="ghost" size="sm" icon={<TrashIcon className="w-4 h-4 text-foreground-muted hover:text-error" />} onClick={(e) => { e.stopPropagation(); handleDeleteSprint(sprint.id); }} />
                </div>
              </div>

              {/* Sprint Issues */}
              {isExpanded && (
                <SprintList
                  id={sprint.id}
                  issues={sprint.issues}
                  selectedIssueIds={selectedIssueIds}
                  onToggleSelection={toggleIssueSelection}
                  onClickIssue={setSelectedIssue}
                  onDeleteIssue={handleDeleteIssue}
                  sprintsWithIssues={sprintsWithIssues}
                  onMoveIssue={handleMoveIssue}
                  onCreateIssue={() => setIsCreateIssueModalOpen(true)}
                  emptyMessage="Plan a sprint by dragging issues here"
                  getParentLabel={getParentLabel}
                />
              )}
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="mb-10">
          <div className="group flex items-center justify-between px-2 py-1.5 transition-colors cursor-pointer rounded-t-md hover:bg-white/[0.03]">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button className="p-0.5 text-foreground-muted hover:text-foreground transition-colors flex-shrink-0">
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-[15px] text-[#DEE4EA] flex items-center gap-3">
                Backlog 
                <span className="text-xs text-foreground-muted font-normal">({filteredBacklogIssues.length} issues)</span>
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center text-xs font-medium border border-white/10 rounded overflow-hidden">
                 <span className="bg-[#DFE1E6]/10 text-[#DFE1E6] px-2 py-0.5">{filteredBacklogIssues.length}</span>
                 <span className="bg-[#0052CC]/20 text-[#4BADE8] px-2 py-0.5 border-l border-white/10">0</span>
                 <span className="bg-[#00875A]/20 text-[#57A55A] px-2 py-0.5 border-l border-white/10">0</span>
              </div>
              <Button variant="secondary" size="sm" className="h-7 text-xs bg-white/10 hover:bg-white/20 border-0 text-[#DEE4EA]" onClick={() => setIsCreateSprintModalOpen(true)}>
                Create sprint
              </Button>
            </div>
          </div>

          <SprintList
            id="backlog"
            issues={filteredBacklogIssues}
            selectedIssueIds={selectedIssueIds}
            onToggleSelection={toggleIssueSelection}
            onClickIssue={setSelectedIssue}
            onDeleteIssue={handleDeleteIssue}
            sprintsWithIssues={sprintsWithIssues}
            onMoveIssue={handleMoveIssue}
            onCreateIssue={() => setIsCreateIssueModalOpen(true)}
            emptyMessage="Your backlog is empty."
            getParentLabel={getParentLabel}
          />
        </div>
      </div>
      
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeIssue ? (
          <div className="bg-background-elevated shadow-2xl rounded-md opacity-90 scale-105 border border-accent/50 rotate-2 pointer-events-none w-[800px]">
             <BacklogIssueRow
                issue={activeIssue}
                isSelected={false}
                onSelect={() => {}}
                onClick={() => {}}
                onDelete={() => {}}
                sprintsWithIssues={[]}
                onMoveIssue={() => {}}
              />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
