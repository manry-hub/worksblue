import { useState } from "react";
import { 
  CheckIcon, 
  XMarkIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { GlobalTask, useGlobalTaskStore } from "@/store/global-task-store";
import { Badge } from "@/components/ui/badge";

interface TaskRowProps {
  task: GlobalTask;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  toggleExpand: () => void;
  onAddSubtask: (parentId: string) => void;
}

export function TaskRow({ task, level, hasChildren, isExpanded, toggleExpand, onAddSubtask }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<GlobalTask>>(task);
  
  const updateTask = useGlobalTaskStore((state) => state.updateTask);
  const deleteTask = useGlobalTaskStore((state) => state.deleteTask);

  const handleSave = () => {
    updateTask(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(task);
    setIsEditing(false);
  };

  const handleCheckbox = () => {
    updateTask(task.id, { completed: !task.completed });
  };

  // Indentation calculation
  const paddingLeft = level * 32 + 16;

  if (isEditing) {
    return (
      <div 
        className="flex items-center gap-4 py-2 px-4 border-b border-white/5 bg-white/[0.02]"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-3 flex flex-col gap-1">
            <input
              type="text"
              value={editData.name || ""}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent"
              placeholder="Task name"
            />
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <input
              type="text"
              value={editData.description || ""}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent"
              placeholder="Description"
            />
          </div>
          <div className="col-span-1 flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100"
              value={editData.progress || 0}
              onChange={(e) => setEditData({ ...editData, progress: parseInt(e.target.value) || 0 })}
              className="w-16 bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent"
            />
            <span className="text-xs text-foreground-muted">%</span>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <input
              type="date"
              value={editData.startDate || ""}
              onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
              className="bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent text-foreground-muted [color-scheme:dark]"
              title="Start Date"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <input
              type="date"
              value={editData.endDate || ""}
              onChange={(e) => setEditData({ ...editData, endDate: e.target.value })}
              className="bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent text-foreground-muted [color-scheme:dark]"
              title="End Date"
            />
          </div>
          <div className="col-span-1 flex flex-col gap-1">
            <input
              type="text"
              value={editData.assignee || ""}
              onChange={(e) => setEditData({ ...editData, assignee: e.target.value })}
              className="bg-background-elevated border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-accent"
              placeholder="Assignee"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={handleSave} className="p-1.5 bg-accent/20 text-accent hover:bg-accent/30 rounded" title="Save">
            <CheckIcon className="w-4 h-4" />
          </button>
          <button onClick={handleCancel} className="p-1.5 bg-white/5 text-foreground-muted hover:bg-white/10 rounded" title="Cancel">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-4 py-3 px-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      {/* Expand/Collapse Toggle */}
      <div className="w-5 flex items-center justify-center shrink-0">
        {hasChildren && (
          <button onClick={toggleExpand} className="text-foreground-muted hover:text-foreground">
            {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Checkbox */}
      <button 
        onClick={handleCheckbox}
        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
          task.completed ? 'bg-success border-success text-white' : 'border-white/20 hover:border-white/40'
        }`}
      >
        {task.completed && <CheckIcon className="w-3.5 h-3.5" />}
      </button>

      {/* Data Columns */}
      <div className="flex-1 grid grid-cols-12 gap-4 items-center min-w-0">
        <div className="col-span-3 min-w-0">
          <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-foreground-muted' : 'text-foreground'}`}>
            {task.name}
          </p>
        </div>
        <div className="col-span-3 min-w-0">
          <p className="text-xs text-foreground-subtle truncate" title={task.description}>
            {task.description || "-"}
          </p>
        </div>
        <div className="col-span-1 flex items-center gap-2">
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full ${task.progress === 100 ? 'bg-success' : 'bg-accent'}`} 
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground-muted">{task.progress || 0}%</span>
        </div>
        <div className="col-span-2 min-w-0">
          <p className="text-xs text-foreground-muted truncate">{task.startDate || "-"}</p>
        </div>
        <div className="col-span-2 min-w-0">
          <p className="text-xs text-foreground-muted truncate">{task.endDate || "-"}</p>
        </div>
        <div className="col-span-1 min-w-0">
          {task.assignee ? (
            <Badge variant="neutral" className="truncate max-w-full text-[10px]">{task.assignee}</Badge>
          ) : (
            <span className="text-xs text-foreground-subtle">-</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onAddSubtask(task.id)} 
          className="p-1.5 text-foreground-muted hover:text-accent hover:bg-white/5 rounded"
          title="Add Subtask"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsEditing(true)} 
          className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-white/5 rounded"
          title="Edit Task"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={() => confirm("Are you sure you want to delete this task and all its subtasks?") && deleteTask(task.id)} 
          className="p-1.5 text-foreground-muted hover:text-danger hover:bg-white/5 rounded"
          title="Delete Task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
