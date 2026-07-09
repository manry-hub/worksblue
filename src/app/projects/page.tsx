"use client";

import { useEffect, useState } from "react";
import { PlusIcon, FolderIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useProjectStore, type Project } from "@/store/project-store";
import { WorkspaceShell } from "@/components/shell/workspace-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { useRouter } from "next/navigation";

const statusVariant: Record<string, "success" | "warning" | "neutral" | "error" | "accent"> = {
  "In progress": "accent",
  "On Hold": "warning",
  Completed: "success",
  Cancelled: "error",
  Planning: "neutral",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
      <div 
        className="bg-accent h-full rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }} 
      />
    </div>
  );
}

function ProjectCard({ p }: { p: Project }) {
  const router = useRouter();

  return (
    <Card 
      className="p-6 transition-transform hover:-translate-y-1 cursor-pointer"
      onClick={() => router.push(`/projects/${p.id}`)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-bright flex items-center justify-center shrink-0">
              <FolderIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-lg leading-tight">{p.name}</h4>
              <span className="text-xs text-foreground-muted">Last updated 2h ago</span>
            </div>
          </div>
          <IconButton 
            icon={<EllipsisHorizontalIcon />} 
            variant="ghost" 
            size="sm" 
            aria-label="Aksi" 
            onClick={(e) => {
              e.stopPropagation(); // prevent navigation
            }}
          />
        </div>
        
        <p className="text-sm text-foreground-muted line-clamp-2 min-h-[40px]">
          {p.description}
        </p>
        
        <div className="space-y-2 mt-2">
          <div className="flex justify-between items-center">
            <Badge variant={statusVariant[p.status] ?? "neutral"}>{p.status}</Badge>
            <span className="text-xs font-semibold text-foreground">{p.progress}%</span>
          </div>
          <ProgressBar value={p.progress} />
        </div>
        
        <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.06]">
          {p.techStack.map((s) => (
            <Badge key={s} variant="neutral">{s}</Badge>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <WorkspaceShell>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight mb-1">Projects</h2>
          <p className="text-foreground-muted">Manage and organize all your development projects.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<PlusIcon />}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {isLoading && projects.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} />
          ))}
          
          {/* Create new card placeholder */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="group relative flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-white/[0.15] glass-card hover:bg-white/[0.02] hover:border-white/[0.3] transition-all cursor-pointer min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent/20 group-hover:text-accent-bright transition-all">
              <PlusIcon className="w-6 h-6" />
            </div>
            <p className="font-medium">Create New Project</p>
            <p className="text-sm text-foreground-muted mt-1">Setup a new workspace</p>
          </div>
        </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </WorkspaceShell>
  );
}
