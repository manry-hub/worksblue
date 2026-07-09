"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectStore, type Project } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon } from "@heroicons/react/24/outline";

const projectSchema = z.object({
  name: z.string().min(3, "Nama project minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  techStack: z.string().min(1, "Masukkan tech stack (pisahkan dengan koma)"),
  status: z.enum(["Planning", "In progress", "On Hold", "Completed", "Cancelled"]),
  repository: z.string().optional(),
  deadline: z.string().optional(),
  liveEnvironment: z.string().optional(),
  figmaDesign: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function EditProjectModal({ 
  isOpen, 
  onClose,
  project
}: { 
  isOpen: boolean; 
  onClose: () => void;
  project: Project;
}) {
  const { updateProject, deleteProject } = useProjectStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description,
      status: project.status,
      techStack: project.techStack.join(", "),
      repository: project.repository || "",
      deadline: project.deadline || "",
      liveEnvironment: project.liveEnvironment || "",
      figmaDesign: project.figmaDesign || "",
    }
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: project.name,
        description: project.description,
        status: project.status,
        techStack: project.techStack.join(", "),
        repository: project.repository || "",
        deadline: project.deadline || "",
        liveEnvironment: project.liveEnvironment || "",
        figmaDesign: project.figmaDesign || "",
      });
    }
  }, [isOpen, project, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    await updateProject(project.id, {
      name: data.name,
      description: data.description,
      status: data.status,
      techStack: data.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      repository: data.repository,
      deadline: data.deadline,
      liveEnvironment: data.liveEnvironment,
      figmaDesign: data.figmaDesign,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setIsDeleting(true);
      await deleteProject(project.id);
      // Let the parent component or layout handle navigation (e.g. redirect to /projects)
      // Usually we redirect inside the page.tsx where this modal is rendered.
      onClose();
    }
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
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Edit Project Details</h2>
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
                Project Name
              </label>
              <input
                {...register("name")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
              {errors.description && <p className="text-error text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                {...register("techStack")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {errors.techStack && <p className="text-error text-xs mt-1">{errors.techStack.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors [&>option]:bg-background-elevated"
              >
                <option value="Planning">Planning</option>
                <option value="In progress">In progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              {errors.status && <p className="text-error text-xs mt-1">{errors.status.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Repository URL
                </label>
                <input
                  {...register("repository")}
                  type="url"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Deadline
                </label>
                <input
                  {...register("deadline")}
                  type="date"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Live Environment URL
                </label>
                <input
                  {...register("liveEnvironment")}
                  type="url"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Figma Design URL
                </label>
                <input
                  {...register("figmaDesign")}
                  type="url"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/[0.06] mt-6">
              <Button type="button" variant="ghost" className="text-error hover:text-error hover:bg-error/10" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
