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

import { useTaskStore, type Task, type TaskStatus } from "@/store/task-store";
import { useProjectStore } from "@/store/project-store";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { createPortal } from "react-dom";

interface KanbanBoardProps {
  projectId: string;
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  filterAssignee?: "all" | "hilman" | "others";
}

export function KanbanBoard({ projectId, onAddTask, onTaskClick, filterAssignee = "all" }: KanbanBoardProps) {
  const { tasks, fetchTasks, updateTasksBulk } = useTaskStore();
  const fetchProjects = useProjectStore(state => state.fetchProjects);
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks(projectId);
    fetchProjects();
  }, [fetchTasks, fetchProjects, projectId]);

  const projectColumns = (project?.columns || []).filter(c => c.id !== "backlog");

  // Setup sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize column tasks
  const columnsData = useMemo(() => {
    const data: Record<string, Task[]> = {};
    projectColumns.forEach(c => {
      data[c.id] = tasks.filter((t) => {
        if (t.status !== c.id) return false;
        
        const assignee = (t.assignee || "hilman").toLowerCase();
        if (filterAssignee === "hilman" && assignee !== "hilman") return false;
        if (filterAssignee === "others" && assignee === "hilman") return false;
        
        return true;
      });
    });
    return data;
  }, [tasks, projectColumns, filterAssignee]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);
      
      if (!activeTask || !overTask) return;

      if (activeTask.status !== overTask.status) {
        // Move task to new column
        const updatedTasks = tasks.map((t) => {
          if (t.id === activeId) {
            return { ...t, status: overTask.status };
          }
          return t;
        });
        
        // Find indices in the new array to reorder
        const activeIndex = updatedTasks.findIndex((t) => t.id === activeId);
        const overIndex = updatedTasks.findIndex((t) => t.id === overId);
        
        const finalTasks = arrayMove(updatedTasks, activeIndex, overIndex);
        updateTasksBulk(projectId, finalTasks);
      }
    }

    // Dropping a task over an empty column area
    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask) return;

      const newStatus = over.data.current?.status as TaskStatus;
      
      if (activeTask.status !== newStatus) {
        const updatedTasks = tasks.map((t) => {
          if (t.id === activeId) {
            return { ...t, status: newStatus };
          }
          return t;
        });
        updateTasksBulk(projectId, updatedTasks);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (isActiveTask && isOverTask) {
      const activeTask = tasks.find((t) => t.id === activeId);
      const overTask = tasks.find((t) => t.id === overId);
      
      if (activeTask && overTask && activeTask.status === overTask.status) {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const updatedTasks = arrayMove(tasks, activeIndex, overIndex);
        updateTasksBulk(projectId, updatedTasks);
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
          {projectColumns.map((col) => (
            <KanbanColumn 
              key={col.id} 
              id={col.id} 
              title={col.title} 
              tasks={columnsData[col.id] || []} 
              onAddTask={onAddTask} 
              onTaskClick={onTaskClick}
            />
          ))}
        </div>

        {typeof document !== "undefined" && createPortal(
          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.4" } } }),
            }}
          >
            {activeTask && <KanbanCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
}
