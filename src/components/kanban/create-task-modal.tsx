"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTaskStore, type TaskStatus } from "@/store/task-store";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon } from "@heroicons/react/24/outline";

const taskSchema = z.object({
  title: z.string().min(3, "Judul task minimal 3 karakter"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  labels: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function CreateTaskModal({ 
  isOpen, 
  onClose,
  projectId,
  initialStatus = "todo"
}: { 
  isOpen: boolean; 
  onClose: () => void;
  projectId: string;
  initialStatus?: TaskStatus;
}) {
  const addTask = useTaskStore((state) => state.addTask);
  const project = useProjectStore((state) => state.projects.find(p => p.id === projectId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = project?.columns || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: initialStatus,
      priority: "medium",
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    await addTask(projectId, {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      labels: data.labels ? data.labels.split(",").map(l => l.trim()).filter(Boolean) : [],
      dueDate: data.dueDate,
      assignee: "Developer", // Mock assignee
    });
    setIsSubmitting(false);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div 
        className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg z-10 animate-fade-in-up">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Create New Task</h2>
            <button 
              onClick={onClose}
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Task Title
              </label>
              <input
                {...register("title")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="e.g. Implement authentication"
              />
              {errors.title && (
                <p className="text-error text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                placeholder="Add more details about this task..."
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
                  placeholder="bug, feature, ui"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none"
                >
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

            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Task"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
