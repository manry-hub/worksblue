"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSprintStore } from "@/store/sprint-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XMarkIcon } from "@heroicons/react/24/outline";

const sprintSchema = z.object({
  name: z.string().min(3, "Sprint name must be at least 3 characters"),
  goal: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type SprintFormValues = z.infer<typeof sprintSchema>;

interface SprintData {
  id: string;
  name: string;
  goal: string;
  startDate?: string;
  endDate?: string;
}

export function EditSprintModal({ 
  isOpen, 
  onClose,
  sprint,
  projectId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  sprint: SprintData | null;
  projectId: string;
}) {
  const updateSprint = useSprintStore((state) => state.updateSprint);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
  });

  useEffect(() => {
    if (isOpen && sprint) {
      reset({
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate ? sprint.startDate.split("T")[0] : "",
        endDate: sprint.endDate ? sprint.endDate.split("T")[0] : "",
      });
    }
  }, [isOpen, sprint, reset]);

  if (!isOpen || !sprint) return null;

  const onSubmit = async (data: SprintFormValues) => {
    setIsSubmitting(true);
    await updateSprint(projectId, sprint.id, {
      name: data.name,
      goal: data.goal || "",
      startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
      endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-background-base/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Edit Sprint</h2>
            <button onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Sprint Name</label>
              <input
                {...register("name")}
                type="text"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1">Sprint Goal (Optional)</label>
              <textarea
                {...register("goal")}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">Start Date</label>
                <input
                  {...register("startDate")}
                  type="date"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">End Date</label>
                <input
                  {...register("endDate")}
                  type="date"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/[0.06] mt-6">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}