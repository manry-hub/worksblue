"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useIssueStore, type Issue } from "@/store/issue-store";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DocumentTextIcon, BugAntIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";

const issueSchema = z.object({
  title: z.string().min(3, "Judul issue minimal 3 karakter"),
  description: z.string().optional(),
  type: z.enum(["epic", "story", "task", "bug"]),
  status: z.string(),
  priority: z.string(),
  labels: z.string().optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
  estimate: z.string().optional(),
  parentId: z.string().optional(),
});

type IssueFormValues = z.infer<typeof issueSchema>;

export function IssueDetailsModal({ 
  isOpen, 
  onClose,
  issue,
  projectId,
  mode = "edit",
  initialStatus,
  sprintId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  issue?: Issue | null;
  projectId: string;
  mode?: "edit" | "create";
  initialStatus?: string;
  sprintId?: string;
}) {
  const { updateIssue, addIssue, deleteIssue, issues: allIssues } = useIssueStore();
  const project = useProjectStore((state) => state.projects.find(p => p.id === projectId));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [checklist, setChecklist] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  
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
  });

  const selectedType = watch("type");

  // Get parent options based on selected type
  const parentOptions = useMemo(() => {
    switch (selectedType) {
      case "story":
        return allIssues.filter(i => i.type === "epic" && i.projectId === projectId && i.id !== issue?.id);
      case "task":
        return allIssues.filter(i => i.type === "story" && i.projectId === projectId && i.id !== issue?.id);
      case "bug":
        return allIssues.filter(i => (i.type === "epic" || i.type === "story") && i.projectId === projectId && i.id !== issue?.id);
      default:
        return [];
    }
  }, [selectedType, allIssues, projectId, issue?.id]);

  const showParentSelector = selectedType !== "epic" && parentOptions.length > 0;

  // Get child issues for the current issue
  const childIssues = useMemo(() => {
    if (!issue) return [];
    return allIssues.filter(i => i.parentId === issue.id);
  }, [issue, allIssues]);

  // Get parent issue info
  const parentIssue = useMemo(() => {
    if (!issue?.parentId) return null;
    return allIssues.find(i => i.id === issue.parentId) || null;
  }, [issue, allIssues]);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && issue) {
        reset({
          title: issue.title,
          description: issue.description || "",
          type: issue.type || "task",
          status: issue.status,
          priority: issue.priority,
          labels: issue.labels?.join(", ") || "",
          dueDate: issue.dueDate || "",
          assignee: issue.assignee || "",
          estimate: issue.estimate?.toString() || "",
          parentId: issue.parentId || "",
        });
        setChecklist(issue.checklist || []);
      } else if (mode === "create") {
        reset({
          title: "",
          description: "",
          type: "task",
          status: initialStatus || "backlog",
          priority: priorities[1]?.id || priorities[0]?.id || "medium",
          labels: "",
          dueDate: "",
          assignee: "",
          estimate: "",
          parentId: "",
        });
        setChecklist([]);
      }
    }
  }, [isOpen, issue, mode, reset]);

  if (!isOpen) return null;
  if (mode === "edit" && !issue) return null;

  const onSubmit = async (data: IssueFormValues) => {
    setIsSubmitting(true);
    const parsedLabels = data.labels ? data.labels.split(",").map(l => l.trim()).filter(Boolean) : [];
    
    if (mode === "create") {
      await addIssue(projectId, {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        labels: parsedLabels,
        dueDate: data.dueDate,
        assignee: data.assignee || "hilman",
        estimate: data.estimate ? parseFloat(data.estimate) : undefined,
        parentId: data.parentId || null,
        sprintId: sprintId,
        checklist,
      });
    } else if (issue) {
      await updateIssue(projectId, issue.id, {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        labels: parsedLabels,
        dueDate: data.dueDate,
        assignee: data.assignee || "hilman",
        estimate: data.estimate ? parseFloat(data.estimate) : undefined,
        parentId: data.parentId || null,
        checklist,
      });
    }
    
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!issue) return;
    if (confirm("Are you sure you want to delete this issue?")) {
      setIsDeleting(true);
      await deleteIssue(projectId, issue.id);
      setIsDeleting(false);
      onClose();
    }
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklist([...checklist, { id: Date.now().toString(), text: newChecklistItem.trim(), completed: false }]);
    setNewChecklistItem("");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const deleteChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <div className="w-4 h-4 rounded-[3px] bg-[#E5493A] flex items-center justify-center flex-shrink-0 text-white"><BugAntIcon className="w-3 h-3" /></div>;
      case "story":
        return <div className="w-4 h-4 rounded-[3px] bg-[#57A55A] flex items-center justify-center flex-shrink-0 text-white"><DocumentTextIcon className="w-3 h-3" /></div>;
      case "epic":
        return <div className="w-4 h-4 rounded-[3px] bg-[#403294] flex items-center justify-center flex-shrink-0 text-white"><DocumentTextIcon className="w-3 h-3" /></div>;
      default:
        return <div className="w-4 h-4 rounded-[3px] bg-[#4BADE8] flex items-center justify-center flex-shrink-0 text-white"><CheckBadgeIcon className="w-3 h-3" /></div>;
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
              {mode === "create" ? "Create New Issue" : "Issue Details"}
            </h2>
            <div className="flex items-center gap-2">
              {mode === "edit" && (
                <button 
                  onClick={handleDelete}
                  className="text-foreground-muted hover:text-error transition-colors p-2"
                  title="Delete Issue"
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

          {/* Parent Issue Info */}
          {mode === "edit" && parentIssue && (
            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm">
              {getTypeIcon(parentIssue.type)}
              <span className="text-foreground-subtle">Parent:</span>
              <span className="text-foreground font-medium">{parentIssue.title}</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-foreground-subtle">{parentIssue.type}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Issue Title
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
                  {priorities.map(p => (
                    <option key={p.id} value={p.id} className="bg-background-elevated">{p.name}</option>
                  ))}
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
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Assignee (Default: hilman)
                </label>
                <input
                  {...register("assignee")}
                  type="text"
                  placeholder="e.g. John Doe"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            {/* Parent Issue Selector */}
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

            {/* Child Issues Section */}
            {mode === "edit" && childIssues.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-2">
                  Child Issues ({childIssues.length})
                </label>
                <div className="space-y-1 bg-white/[0.02] border border-white/[0.06] rounded-lg p-2">
                  {childIssues.map(child => (
                    <div key={child.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.03] text-sm">
                      {getTypeIcon(child.type)}
                      <span className="text-[10px] uppercase font-bold px-1 py-0.5 rounded bg-white/[0.06] text-foreground-subtle">{child.type}</span>
                      <span className="text-foreground flex-1 truncate">{child.title}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${
                        child.status === "done" ? "bg-[#00875A]/20 text-[#57A55A]" :
                        child.status === "in-progress" ? "bg-[#0052CC]/30 text-[#4BADE8]" :
                        "bg-[#DFE1E6]/10 text-[#DFE1E6]"
                      }`}>
                        {child.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Checklist
              </label>
              <div className="space-y-2 mb-3">
                {checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="w-4 h-4 rounded-sm border-white/30 bg-transparent accent-accent cursor-pointer"
                    />
                    <span className={`flex-1 text-sm transition-colors ${item.completed ? 'text-foreground-muted line-through' : 'text-foreground'}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-foreground-muted hover:text-error transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem(); } }}
                  placeholder="Add a checklist item..."
                  className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
                <Button type="button" variant="secondary" onClick={addChecklistItem}>Add</Button>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/[0.06] mt-6">
              <div className="text-xs text-foreground-subtle">
                {mode === "edit" && issue ? (
                  <>
                    Created: {new Date(issue.createdAt).toLocaleString()}
                    {issue.updatedAt && <><br/>Last updated: {new Date(issue.updatedAt).toLocaleString()}</>}
                  </>
                ) : null}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : mode === "create" ? "Create Issue" : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
