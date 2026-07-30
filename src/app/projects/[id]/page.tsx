"use client";

import { useEffect, useState, use } from "react";
import { useProjectStore } from "@/store/project-store";
import { useSprintStore } from "@/store/sprint-store";
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
import {
  generatePlanningMarkdown, 
  generateRequirementsMarkdown, 
  generateDesignMarkdown, 
  generateTestingMarkdown, 
  generateDeploymentMarkdown, 
  generateBriefMarkdown,
  generateAllMarkdown, 
  downloadMarkdown 
} from "@/lib/export-markdown";

export default function ProjectOverviewPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { fetchProjects, isLoading } = useProjectStore();
  const { fetchSprints, sprints } = useSprintStore();
  
  // Select project directly from store so it stays reactive to edits
  const project = useProjectStore(state => state.projects.find(p => p.id === params.id));
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchSprints(params.id);
  }, [fetchProjects, fetchSprints, params.id]);

  const projectSprints = sprints.filter(s => s.projectId === params.id).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

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
            <h3 className="text-xl font-semibold tracking-tight mb-4">Milestone Activity</h3>
            <Card className="p-6">
              {projectSprints.length === 0 ? (
                <div className="flex items-center justify-center min-h-[160px]">
                  <p className="text-foreground-muted text-sm">No milestones or sprints defined yet.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-white/10 ml-3 md:ml-4 space-y-8 pb-2 pt-2">
                  {projectSprints.map((sprint, index) => {
                    const isActive = sprint.status === "Active";
                    const isCompleted = sprint.status === "Completed";
                    
                    let dotColor = "bg-[#22272B] border-white/20";
                    if (isActive) dotColor = "bg-accent border-accent-bright shadow-[0_0_10px_rgba(59,130,246,0.5)]";
                    if (isCompleted) dotColor = "bg-success border-success";

                    return (
                      <div key={sprint.id} className="relative pl-6 md:pl-8">
                        {/* Dot */}
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${dotColor} flex items-center justify-center z-10`} />
                        
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                          <h4 className={`text-base font-semibold ${isActive ? 'text-accent-bright' : isCompleted ? 'text-foreground' : 'text-foreground-muted'}`}>
                            {sprint.name}
                          </h4>
                          <Badge variant={isActive ? "accent" : isCompleted ? "success" : "neutral"} className="w-fit scale-90 sm:scale-100 origin-left sm:origin-right">
                            {sprint.status}
                          </Badge>
                        </div>
                        
                        <div className="text-[11px] text-foreground-muted mb-2 flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>{new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}</span>
                        </div>
                        
                        {sprint.goal && (
                          <p className="text-sm text-foreground-subtle bg-white/[0.02] border border-white/5 p-3 rounded-lg mt-3">
                            {sprint.goal}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold tracking-tight mb-4">Export Documentation</h3>
            <Card className="p-6 gap-3">
               <Button variant="secondary" onClick={() => downloadMarkdown(generateBriefMarkdown(project), `${project.name}-Project-Brief.md`)} className="text-xs">
                 Project Brief
               </Button>
               <Button variant="secondary" onClick={() => downloadMarkdown(generatePlanningMarkdown(project), `${project.name}-Planning.md`)} className="text-xs">
                 Planning
               </Button>
               <Button variant="secondary" onClick={() => downloadMarkdown(generateRequirementsMarkdown(project), `${project.name}-Requirements.md`)} className="text-xs">
                 Requirements
               </Button>
               <Button variant="secondary" onClick={() => downloadMarkdown(generateDesignMarkdown(project), `${project.name}-Design.md`)} className="text-xs">
                 System Design
               </Button>
               <Button variant="secondary" onClick={() => downloadMarkdown(generateTestingMarkdown(project), `${project.name}-Testing.md`)} className="text-xs">
                 Testing
               </Button>
               <Button variant="secondary" onClick={() => downloadMarkdown(generateDeploymentMarkdown(project), `${project.name}-Deployment.md`)} className="col-span-2 text-xs">
                 Deployment
               </Button>
                 <Button variant="primary" onClick={() => downloadMarkdown(generateAllMarkdown(project), `${project.name}-Complete.md`)}>
                   Export All (.md)
                 </Button>
            </Card>
          </section>

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
