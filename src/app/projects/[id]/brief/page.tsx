"use client";

import { use, useEffect, useState } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { EditableTextarea } from "@/components/ui/editable-input";
import { 
  RocketLaunchIcon, 
  UserIcon, 
  UserCircleIcon, 
  ChatBubbleLeftRightIcon, 
  BellAlertIcon, 
  CurrencyDollarIcon, 
  CalendarDaysIcon, 
  UserGroupIcon, 
  ArrowPathIcon, 
  SparklesIcon, 
  ShieldExclamationIcon,
  
  DocumentChartBarIcon
} from "@heroicons/react/24/outline";

export default function ProjectBriefBoard(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [brief, setBrief] = useState<NonNullable<Project['brief']>>({});

  useEffect(() => {
    if (!project) {
      fetchProjects();
    } else {
      setBrief(project.brief || {});
    }
  }, [project, fetchProjects]);

  const saveChanges = async (field: keyof NonNullable<Project['brief']>, value: string) => {
    if (!project) return;
    const updatedBrief = { ...brief, [field]: value };
    setBrief(updatedBrief);
    await updateProject(projectId, { brief: updatedBrief });
  };

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project brief...</div>;

  const sections = [
    { key: "mission", title: "Mission", icon: RocketLaunchIcon, placeholder: "What is the mission?" },
    { key: "responsible", title: "Responsible", icon: UserIcon, placeholder: "Who is doing the work?" },
    { key: "accountable", title: "Accountable", icon: UserCircleIcon, placeholder: "Who is accountable for success?" },
    { key: "consulted", title: "Consulted", icon: ChatBubbleLeftRightIcon, placeholder: "Who provides input?" },
    { key: "informed", title: "Informed", icon: BellAlertIcon, placeholder: "Who needs to be kept in the loop?" },
    { key: "budget", title: "High Level Budget", icon: CurrencyDollarIcon, placeholder: "What is the estimated budget?" },
    { key: "timeline", title: "High Level Timeline", icon: CalendarDaysIcon, placeholder: "Key dates and milestones..." },
    { key: "culture", title: "Culture", icon: UserGroupIcon, placeholder: "Team culture and values..." },
    { key: "changeCapacity", title: "Change capacity", icon: ArrowPathIcon, placeholder: "How well can the team adapt?" },
    { key: "guidingPrinciples", title: "Guiding principles", icon: SparklesIcon, placeholder: "Core principles guiding decisions..." },
    { key: "risksAssessment", title: "Risks Assessment", icon: ShieldExclamationIcon, placeholder: "Potential risks and mitigations..." },
  ] as const;

  return (
    <div className="h-full max-w-8xl mx-auto pb-12">
      {/* Header section matching PRD requirements */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
         
          <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Project Brief </h2>
        </div>
        
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2  gap-6">
        {sections.map((section) => (
          <Card key={section.key} className="p-5 bg-background-elevated/40 backdrop-blur-sm border-white/5 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <section.icon className="w-4 h-4 text-accent" />
              <h3 className="text-base font-medium text-foreground">{section.title}</h3>
            </div>
            <EditableTextarea
              value={brief[section.key] || ""}
              onSave={(val) => saveChanges(section.key, val)}
              placeholder={section.placeholder}
              className="w-full flex-1 min-h-[100px] bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.04] transition-all resize-none overflow-hidden"
            />
          </Card>
        ))}
      </div>
    </div>
  );
}
