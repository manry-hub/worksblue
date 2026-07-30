"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragOverEvent, 
  DragEndEvent,
  defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useIssueStore, type Issue, type IssueStatus } from "@/store/issue-store";
import { useProjectStore } from "@/store/project-store";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { createPortal } from "react-dom";
import { ColumnConfig } from "@/types/sprint";

interface KanbanBoardProps {
  projectId: string;
  onAddIssue?: (status: IssueStatus) => void;
  onIssueClick?: (issue: Issue) => void;
  filterAssignee?: "all" | "hilman" | "others";
  sprintId?: string;
}

export function KanbanBoard({ projectId, onAddIssue, onIssueClick, filterAssignee = "all", sprintId }: KanbanBoardProps) {
  const { issues, fetchIssues, updateIssuesBulk } = useIssueStore();
  const fetchProjects = useProjectStore(state => state.fetchProjects);
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // Load issues on mount
  useEffect(() => {
    fetchIssues(projectId);
    fetchProjects();
  }, [fetchIssues, fetchProjects, projectId]);

  const projectColumns = (project?.columns || []).filter(c => c.id !== "backlog");

  // Convert to ColumnConfig with wipLimit and order
  const columnConfigs: ColumnConfig[] = projectColumns.map((c, index) => ({
    id: c.id,
    title: c.title,
    order: c.order ?? index,
    wipLimit: c.wipLimit ?? null
  }));

  // Setup sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize column issues
  const columnsData = useMemo(() => {
    const data: Record<string, Issue[]> = {};
    projectColumns.forEach(c => {
      data[c.id] = issues.filter((i) => {
        if (i.status !== c.id) return false;
        
        // Filter by sprint if specified
        if (sprintId && i.sprintId !== sprintId) return false;
        
        const assignee = (i.assignee || "hilman").toLowerCase();
        if (filterAssignee === "hilman" && assignee !== "hilman") return false;
        if (filterAssignee === "others" && assignee === "hilman") return false;
        
        return true;
      });
    });
    return data;
  }, [issues, projectColumns, filterAssignee, sprintId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const issue = issues.find((i) => i.id === active.id);
    if (issue) setActiveIssue(issue);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveIssue = active.data.current?.type === "Issue";
    const isOverIssue = over.data.current?.type === "Issue";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveIssue) return;

    // Dropping an issue over another issue
    if (isActiveIssue && isOverIssue) {
      const activeIssue = issues.find((i) => i.id === activeId);
      const overIssue = issues.find((i) => i.id === overId);
      
      if (!activeIssue || !overIssue) return;

      if (activeIssue.status !== overIssue.status) {
        // Move issue to new column
        const updatedIssues = issues.map((i) => {
          if (i.id === activeId) {
            return { ...i, status: overIssue.status };
          }
          return i;
        });
        
        // Find indices in the new array to reorder
        const activeIndex = updatedIssues.findIndex((i) => i.id === activeId);
        const overIndex = updatedIssues.findIndex((i) => i.id === overId);
        
        const finalIssues = arrayMove(updatedIssues, activeIndex, overIndex);
        updateIssuesBulk(projectId, finalIssues);
      }
    }

    // Dropping an issue over an empty column area
    if (isActiveIssue && isOverColumn) {
      const activeIssue = issues.find((i) => i.id === activeId);
      if (!activeIssue) return;

      const newStatus = over.data.current?.status as IssueStatus;
      
      if (activeIssue.status !== newStatus) {
        const updatedIssues = issues.map((i) => {
          if (i.id === activeId) {
            return { ...i, status: newStatus };
          }
          return i;
        });
        updateIssuesBulk(projectId, updatedIssues);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveIssue = active.data.current?.type === "Issue";
    const isOverIssue = over.data.current?.type === "Issue";

    if (isActiveIssue && isOverIssue) {
      const activeIssue = issues.find((i) => i.id === activeId);
      const overIssue = issues.find((i) => i.id === overId);
      
      if (activeIssue && overIssue && activeIssue.status === overIssue.status) {
        const activeIndex = issues.findIndex((i) => i.id === activeId);
        const overIndex = issues.findIndex((i) => i.id === overId);
        const updatedIssues = arrayMove(issues, activeIndex, overIndex);
        updateIssuesBulk(projectId, updatedIssues);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] overflow-x-auto pb-4 custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 h-full items-start">
          {columnConfigs.map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              issues={columnsData[col.id] || []} 
              onAddIssue={onAddIssue} 
              onIssueClick={onIssueClick}
            />
          ))}
        </div>

        {typeof document !== "undefined" && createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
            }}
          >
            {activeIssue && <KanbanCard issue={activeIssue} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}