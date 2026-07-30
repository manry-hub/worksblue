"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useIssueStore, type IssueStatus, type Issue } from "@/store/issue-store";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon } from "@heroicons/react/24/outline";

const issueSchema = z.object({
  title: z.string().min(3, "Judul issue minimal 3 karakter"),
  description: z.string().optional(),
  type: z.enum(["epic", "story", "task", "bug"]),
  status: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  labels: z.string().optional(),
  dueDate: z.string().optional(),
  estimate: z.string().optional(),
  parentId: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export function CreateIssueModal({ 
  isOpen, 
  onClose,
  projectId,
  initialStatus = "todo",
  sprintId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  projectId: string;
  initialStatus?: IssueStatus;
  sprintId?: string;
}) {
  const addIssue = useIssueStore((state) => state.addIssue);
  const allIssues = useIssueStore((state) => state.issues);
  const project = useProjectStore((state) => state.projects.find(p => p.id === projectId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = project?.columns || [];
  const priorities = project?.priorities || [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" }
  ];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      type: "task",
      status: initialStatus,
      priority: "medium",
    }
  });

  const selectedType = watch("type");

  // Get parent options based on selected type
  const getParentOptions = (): Issue[] => {
    switch (selectedType) {
      case "story":
        return allIssues.filter(i => i.type === "epic" && i.projectId === projectId);
      case "task":
        return allIssues.filter(i => i.type === "story" && i.projectId === projectId);
      case "bug":
        return allIssues.filter(i => (i.type === "epic" || i.type === "story") && i.projectId === projectId);
      default:
        return [];
    }
  };

  const parentOptions = getParentOptions();
  const showParentSelector = selectedType !== "epic" && parentOptions.length > 0;

  if (!isOpen) return null;

  const onSubmit = async (data: IssueFormValues) => {
    setIsSubmitting(true);
    await addIssue(projectId, {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      priority: data.priority,
      labels: data.labels ? data.labels.split(",").map(l => l.trim()).filter(Boolean) : [],
      dueDate: data.dueDate,
      assignee: "Developer", // Mock assignee
      sprintId: sprintId,
      parentId: data.parentId || null,
      estimate: data.estimate ? parseFloat(data.estimate) : undefined,
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
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Create New Issue</h2>
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
                Issue Title
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
                placeholder="Add more details about this issue..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Issue Type
                </label>
                <select
                  {...register("type")}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none"
                >
                  <option value="task" className="bg-background-elevated">Task</option>
                  <option value="story" className="bg-background-elevated">Story</option>
                  <option value="bug" className="bg-background-elevated">Bug</option>
                  <option value="epic" className="bg-background-elevated">Epic</option>
                </select>
              </div>
              {showParentSelector && (
                <div>
                  <label className="block text-sm font-medium text-foreground-muted mb-1">
                    Parent {selectedType === "task" ? "Story" : selectedType === "story" ? "Epic" : "Issue"}
                  </label>
                  <select
                    {...register("parentId")}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none"
                  >
                    <option value="" className="bg-background-elevated">None</option>
                    {parentOptions.map(p => (
                      <option key={p.id} value={p.id} className="bg-background-elevated">
                        {p.type === "epic" ? "⚡" : "📖"} {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  Estimate (Story Points)
                </label>
                <input
                  {...register("estimate")}
                  type="number"
                  min="0"
                  step="0.5"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  placeholder="e.g. 3"
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
                  {priorities.map(p => (
                    <option key={p.id} value={p.id} className="bg-background-elevated">{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Create Issue"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
