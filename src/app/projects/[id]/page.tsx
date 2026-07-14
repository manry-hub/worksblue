"use client";

import { useEffect, useState, use } from "react";
import { useProjectStore } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderIcon, 
  ClockIcon, 
  ClipboardDocumentCheckIcon, 
  ArrowTrendingUpIcon 
} from "@heroicons/react/24/outline";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { useRouter } from "next/navigation";

export default function ProjectOverviewPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { fetchProjects, isLoading } = useProjectStore();
  
  // Select project directly from store so it stays reactive to edits
  const project = useProjectStore(state => state.projects.find(p => p.id === params.id));
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle redirect if project doesn't exist after loading
  useEffect(() => {
    if (!isLoading && !project && useProjectStore.getState().projects.length > 0) {
      // The project might actually not exist
      const exists = useProjectStore.getState().projects.some(p => p.id === params.id);
      if (!exists) {
        router.push("/projects");
      }
    }
  }, [isLoading, project, params.id, router]);

  if (isLoading || !project) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-semibold tracking-tight">{project.name}</h2>
            <Badge variant="accent">{project.version}</Badge>
            <Badge variant="neutral">{project.status}</Badge>
          </div>
          <p className="text-foreground-muted max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>Edit Details</Button>
          <Button variant="primary">Share</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-bright flex items-center justify-center shrink-0">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight">{project.progress}%</span>
            <p className="text-sm text-foreground-muted mt-1">Overall Progress</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center shrink-0">
              <ClipboardDocumentCheckIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold tracking-tight">{project.openTasks}</span>
            <p className="text-sm text-foreground-muted mt-1">Open Tasks</p>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0">
              <FolderIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight">{project.status}</span>
            <p className="text-sm text-foreground-muted mt-1">Project Status</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center shrink-0">
              <ClockIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight line-clamp-1">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No Deadline"}</span>
            <p className="text-sm text-foreground-muted mt-1">Target Deadline</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xl font-semibold tracking-tight mb-4">Technology Stack</h3>
            <Card className="p-6">
              <div className="flex flex-wrap gap-2">
                {project.techStack.map(stack => (
                  <Badge key={stack} variant="neutral">{stack}</Badge>
                ))}
              </div>
            </Card>
          </section>

          <section>
            <h3 className="text-xl font-semibold tracking-tight mb-4">Recent Activity</h3>
            <Card className="p-6 flex items-center justify-center min-h-[200px]">
              <p className="text-foreground-muted text-sm">No recent activity</p>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold tracking-tight mb-4">Quick Links</h3>
            <Card className="p-6 space-y-3">
              {project.repository ? (
                <Button variant="secondary" className="w-full justify-start" onClick={() => window.open(project.repository, "_blank")}>
                  View Repository
                </Button>
              ) : (
                <Button variant="secondary" className="w-full justify-start" disabled>
                  No Repository Linked
                </Button>
              )}
              {project.liveEnvironment ? (
                <Button variant="secondary" className="w-full justify-start" onClick={() => window.open(project.liveEnvironment, "_blank")}>
                  Live Environment
                </Button>
              ) : (
                <Button variant="secondary" className="w-full justify-start" disabled>
                  No Live Environment
                </Button>
              )}
              
              {project.figmaDesign ? (
                <Button variant="secondary" className="w-full justify-start" onClick={() => window.open(project.figmaDesign, "_blank")}>
                  Figma Design
                </Button>
              ) : (
                <Button variant="secondary" className="w-full justify-start" disabled>
                  No Figma Design
                </Button>
              )}
            </Card>
          </section>
        </div>
      </div>

      <EditProjectModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
    </>
  );
}
