"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTaskStore, type Task, type TaskStatus } from "@/store/task-store";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const taskSchema = z.object({
  title: z.string().min(3, "Judul task minimal 3 karakter"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  labels: z.string().optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskDetailsModal({ 
  isOpen, 
  onClose,
  task,
  projectId,
  mode = "edit"
}: { 
  isOpen: boolean; 
  onClose: () => void;
  task?: Task | null;
  projectId: string;
  mode?: "edit" | "create";
}) {
  const { updateTask, addTask, deleteTask } = useTaskStore();
  const project = useProjectStore((state) => state.projects.find(p => p.id === projectId));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const columns = project?.columns || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && task) {
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          labels: task.labels?.join(", ") || "",
          dueDate: task.dueDate || "",
          assignee: task.assignee || "",
        });
      } else if (mode === "create") {
        reset({
          title: "",
          description: "",
          status: "backlog",
          priority: "medium",
          labels: "",
          dueDate: "",
          assignee: "",
        });
      }
    }
  }, [isOpen, task, mode, reset]);

  if (!isOpen) return null;
  if (mode === "edit" && !task) return null;

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    const parsedLabels = data.labels ? data.labels.split(",").map(l => l.trim()).filter(Boolean) : [];
    
    if (mode === "create") {
      await addTask(projectId, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        labels: parsedLabels,
        dueDate: data.dueDate,
        assignee: data.assignee || "hilman",
      });
    } else if (task) {
      await updateTask(projectId, task.id, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        labels: parsedLabels,
        dueDate: data.dueDate,
        assignee: data.assignee || "hilman",
      });
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true);
      await deleteTask(projectId, task.id);
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl z-10 animate-fade-in-up">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {mode === "create" ? "Create New Task" : "Task Details"}
            </h2>
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <button 
                  onClick={handleDelete}
                  className="text-foreground-muted hover:text-error transition-colors p-2"
                  title="Delete Task"
                  disabled={isDeleting}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={onClose}
                className="text-foreground-muted hover:text-foreground transition-colors p-2"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Task Title
              </label>
              <input
                {...register("title")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {errors.title && <p className="text-error text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none"
                >
                  <option value="backlog" className="bg-background-elevated">Backlog</option>
                  {columns.map(col => (
                    <option key={col.id} value={col.id} className="bg-background-elevated">{col.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none"
                >
                  <option value="low" className="bg-background-elevated">Low</option>
                  <option value="medium" className="bg-background-elevated">Medium</option>
                  <option value="high" className="bg-background-elevated">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={5}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Labels (comma separated)
                </label>
                <input
                  {...register("labels")}
                  type="text"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Due Date
                </label>
                <input
                  {...register("dueDate")}
                  type="date"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Assignee (Default: hilman)
              </label>
              <input
                {...register("assignee")}
                type="text"
                placeholder="e.g. John Doe, or leave empty for 'hilman'"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/[0.06] mt-6">
              <div className="text-xs text-foreground-subtle">
                {mode === "edit" && task ? (
                  <>
                    Created: {new Date(task.createdAt).toLocaleString()}
                    {task.updatedAt && <><br/>Last updated: {new Date(task.updatedAt).toLocaleString()}</>}
                  </>
                ) : null}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create Task" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
