import { useState } from "react";
import { GlobalTask } from "@/store/global-task-store";
import { TaskRow } from "./task-row";

interface TaskTreeProps {
  tasks: GlobalTask[];
  parentId: string | null;
  level?: number;
  onAddSubtask: (parentId: string) => void;
}

export function TaskTree({ tasks, parentId, level = 0, onAddSubtask }: TaskTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const children = tasks
    .filter((t) => t.parentId === parentId)
    .sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });

  if (children.length === 0) return null;

  return (
    <>
      {children.map((task) => {
        const hasChildren = tasks.some((t) => t.parentId === task.id);
        const isExpanded = expandedNodes[task.id] !== false; // Default expanded

        return (
          <div key={task.id} className="flex flex-col">
            <TaskRow
              task={task}
              level={level}
              hasChildren={hasChildren}
              isExpanded={isExpanded}
              toggleExpand={() => toggleExpand(task.id)}
              onAddSubtask={onAddSubtask}
            />
            {isExpanded && hasChildren && (
              <TaskTree
                tasks={tasks}
                parentId={task.id}
                level={level + 1}
                onAddSubtask={onAddSubtask}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
