"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useProjectStore } from "@/store/project-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon } from "@heroicons/react/24/outline";

const projectSchema = z.object({
  name: z.string().min(3, "Nama project minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  techStack: z.string().min(1, "Masukkan tech stack (pisahkan dengan koma)"),
  repository: z.string().optional(),
  deadline: z.string().optional(),
  liveEnvironment: z.string().optional(),
  figmaDesign: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function CreateProjectModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const addProject = useProjectStore((state) => state.addProject);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  if (!isOpen) return null;

  const onSubmit = (data: ProjectFormValues) => {
    setIsSubmitting(true);
    // Simulate network delay for UX
    setTimeout(() => {
      addProject({
        name: data.name,
        description: data.description,
        status: "Planning",
        techStack: data.techStack.split(",").map((s) => s.trim()).filter(Boolean),
        repository: data.repository,
        deadline: data.deadline,
        liveEnvironment: data.liveEnvironment,
        figmaDesign: data.figmaDesign,
      });
      setIsSubmitting(false);
      reset();
      onClose();
    }, 600);
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
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Create new project</h2>
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
                placeholder="e.g. WorksBlue V2"
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name.message}</p>
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
                placeholder="A workspace for developers..."
              />
              {errors.description && (
                <p className="text-error text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                {...register("techStack")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                placeholder="Next.js, TypeScript, Tailwind"
              />
              {errors.techStack && (
                <p className="text-error text-xs mt-1">{errors.techStack.message}</p>
              )}
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
                  placeholder="https://github.com/..."
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
                  placeholder="https://..."
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
                  placeholder="https://figma.com/..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
