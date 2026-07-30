"use client";

import { use, useState, useEffect } from "react";
import { useProjectStore } from "@/store/project-store";
import { WorkflowSettings } from "@/components/settings/workflow-settings";
import { IssueSettings } from "@/components/settings/issue-settings";
import { GeneralSettings } from "@/components/settings/general-settings";
import { Cog6ToothIcon, RectangleGroupIcon, TagIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

type Tab = "workflow" | "issues" | "general";

export default function SettingsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  
  const project = useProjectStore(state => state.getProject(projectId));
  const updateProject = useProjectStore(state => state.updateProject);
  const fetchProjects = useProjectStore(state => state.fetchProjects);
  
  const [activeTab, setActiveTab] = useState<Tab>("workflow");

  useEffect(() => {
    if (!project) {
      fetchProjects();
    }
  }, [project, fetchProjects]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
    { id: "workflow", label: "Workflow", icon: RectangleGroupIcon },
    { id: "issues", label: "Issues", icon: TagIcon },
    { id: "general", label: "General", icon: Cog6ToothIcon },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Project Configuration</h1>
        <p className="text-foreground-muted mt-1 text-sm">Manage workflow, issues, and project settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-accent/10 text-accent"
                    : "text-foreground-muted hover:bg-white/[0.05] hover:text-foreground"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-accent" : "text-foreground-muted")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="glass-panel p-6 sm:p-8 rounded-xl border border-white/[0.06] bg-background-elevated/40 backdrop-blur-xl">
            {activeTab === "workflow" && (
              <WorkflowSettings project={project} updateProject={(data) => updateProject(projectId, data)} />
            )}
            {activeTab === "issues" && (
              <IssueSettings project={project} updateProject={(data) => updateProject(projectId, data)} />
            )}
            {activeTab === "general" && (
              <GeneralSettings project={project} updateProject={(data) => updateProject(projectId, data)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
