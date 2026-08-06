"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardDocumentCheckIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  FolderIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolidIcon } from "@heroicons/react/24/solid";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import { useProjectStore, type Project } from "@/store/project-store";
import { useSprintStore } from "@/store/sprint-store";
import type { Sprint } from "@/types/sprint";

/* ------------------------------------------------- */
/*  Types                                            */
/* ------------------------------------------------- */

type ComputedDeadline = {
  id: string;
  title: string;
  project: string;
  projectId: string;
  date: string;
  urgency: "normal" | "soon" | "overdue";
};

type LifecycleStage = {
  name: string;
  progress: number;
  state: "complete" | "active" | "upcoming";
};

/* ------------------------------------------------- */
/*  Helpers                                          */
/* ------------------------------------------------- */

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

function RelativeTime({ dateString }: { dateString: string }) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) return <>just now</>;
  if (diffMins < 60) return <>{diffMins}m ago</>;
  if (diffHours < 24) return <>{diffHours}h ago</>;
  if (diffDays < 30) return <>{diffDays}d ago</>;
  return <>{Math.floor(diffDays / 30)}mo ago</>;
}

/** Compute project deadlines dynamically from project store data */
function computeDeadlines(projects: Project[]): ComputedDeadline[] {
  const now = new Date();
  
  return projects
    .filter(p => p.deadline)
    .map(p => {
      const deadlineDate = new Date(p.deadline!);
      const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let urgency: "normal" | "soon" | "overdue" = "normal";
      if (diffDays < 0) urgency = "overdue";
      else if (diffDays <= 7) urgency = "soon";
      
      return {
        id: `deadline-${p.id}`,
        title: p.name,
        project: p.name,
        projectId: p.id,
        date: p.deadline!,
        urgency,
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/** Compute SDLC lifecycle progress from actual project field completeness */
function computeLifecycle(projects: Project[]): LifecycleStage[] {
  if (projects.length === 0) {
    return [
      { name: "Planning", progress: 0, state: "upcoming" },
      { name: "Brief", progress: 0, state: "upcoming" },
      { name: "Requirements", progress: 0, state: "upcoming" },
      { name: "Design", progress: 0, state: "upcoming" },
      { name: "Implementation", progress: 0, state: "upcoming" },
      { name: "Testing", progress: 0, state: "upcoming" },
      { name: "Deployment", progress: 0, state: "upcoming" },
    ];
  }

  // Aggregate progress across all projects
  const stages: { name: string; progressSum: number; count: number }[] = [
    { name: "Planning", progressSum: 0, count: 0 },
    { name: "Brief", progressSum: 0, count: 0 },
    { name: "Requirements", progressSum: 0, count: 0 },
    { name: "Design", progressSum: 0, count: 0 },
    { name: "Implementation", progressSum: 0, count: 0 },
    { name: "Testing", progressSum: 0, count: 0 },
    { name: "Deployment", progressSum: 0, count: 0 },
  ];

  for (const p of projects) {
    // Planning: problemStatement + objective + stakeholders + timeline
    const planningFields = [
      p.problemStatement ? 1 : 0,
      p.objective ? 1 : 0,
      (p.stakeholders && p.stakeholders.length > 0) ? 1 : 0,
      (p.timeline?.startDate || p.timeline?.endDate) ? 1 : 0,
    ];
    stages[0].progressSum += Math.round((planningFields.reduce((a, b) => a + b, 0) / planningFields.length) * 100);
    stages[0].count++;

    // Brief: count filled brief fields
    const briefFields = p.brief ? [
      p.brief.mission,
      p.brief.responsible,
      p.brief.accountable,
      p.brief.consulted,
      p.brief.informed,
      p.brief.budget,
      p.brief.timeline,
      p.brief.culture,
      p.brief.changeCapacity,
      p.brief.guidingPrinciples,
      p.brief.risksAssessment,
    ] : [];
    const briefFilled = briefFields.filter(Boolean).length;
    const briefTotal = 11;
    stages[1].progressSum += Math.round((briefFilled / briefTotal) * 100);
    stages[1].count++;

    // Requirements: functional + nonFunctional + externalInterface
    const reqFunctional = p.requirements?.functional?.length ?? 0;
    const reqNonFunctional = p.requirements?.nonFunctional?.length ?? 0;
    const reqExternal = p.requirements?.externalInterface?.length ?? 0;
    const reqTotal = reqFunctional + reqNonFunctional + reqExternal;
    // If any requirements exist, consider it has some progress
    stages[2].progressSum += reqTotal > 0 ? Math.min(100, Math.round((reqTotal / Math.max(reqTotal, 1)) * 100)) : 0;
    stages[2].count++;

    // Design: diagrams + RBAC + API design + tech specs
    const designFields = [
      (p.design?.contextDiagrams && p.design.contextDiagrams.length > 0) ? 1 : 0,
      (p.design?.usecaseDiagrams && p.design.usecaseDiagrams.length > 0) ? 1 : 0,
      (p.design?.erds && p.design.erds.length > 0) ? 1 : 0,
      (p.design?.uiuxDiagrams && p.design.uiuxDiagrams.length > 0) ? 1 : 0,
      (p.design?.rbac && p.design.rbac.length > 0) ? 1 : 0,
      (p.design?.apiDesign && p.design.apiDesign.length > 0) ? 1 : 0,
      (p.design?.techSpecs && p.design.techSpecs.length > 0) ? 1 : 0,
    ];
    const designFilled = designFields.reduce((a, b) => a + b, 0);
    stages[3].progressSum += Math.round((designFilled / designFields.length) * 100);
    stages[3].count++;

    // Implementation: checked tasks vs total
    const implTasks = p.implementationTasks ?? {};
    const implTotal = Object.keys(implTasks).length;
    const implDone = Object.values(implTasks).filter(Boolean).length;
    stages[4].progressSum += implTotal > 0 ? Math.round((implDone / implTotal) * 100) : 0;
    stages[4].count++;

    // Testing: Passed test cases vs total
    const testTotal = p.testCases?.length ?? 0;
    const testPassed = p.testCases?.filter(tc => tc.executionStatus === "Passed").length ?? 0;
    stages[5].progressSum += testTotal > 0 ? Math.round((testPassed / testTotal) * 100) : 0;
    stages[5].count++;

    // Deployment: platform + accounts + environments + seeds
    const deployFields = [
      p.deployment?.platform ? 1 : 0,
      (p.deployment?.accounts && p.deployment.accounts.length > 0) ? 1 : 0,
      (p.deployment?.environments && p.deployment.environments.length > 0) ? 1 : 0,
      (p.deployment?.seeds && p.deployment.seeds.length > 0) ? 1 : 0,
    ];
    const deployFilled = deployFields.reduce((a, b) => a + b, 0);
    stages[6].progressSum += Math.round((deployFilled / deployFields.length) * 100);
    stages[6].count++;
  }

  return stages.map(s => {
    const progress = s.count > 0 ? Math.round(s.progressSum / s.count) : 0;
    let state: "complete" | "active" | "upcoming" = "upcoming";
    if (progress >= 100) state = "complete";
    else if (progress > 0) state = "active";
    return { name: s.name, progress, state };
  });
}

/* ------------------------------------------------- */
/*  Stat card                                        */
/* ------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: "accent" | "warning" | "error" | "success";
}) {
  return (
    <Card className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          {
            "bg-accent/15 text-accent-bright": iconColor === "accent",
            "bg-warning/15 text-warning": iconColor === "warning",
            "bg-error/15 text-error": iconColor === "error",
            "bg-success/15 text-success": iconColor === "success",
          }
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <p className="text-sm text-foreground-muted mt-1">{label}</p>
      </div>
    </Card>
  );
}

/* ------------------------------------------------- */
/*  Project card                                     */
/* ------------------------------------------------- */

function ProjectCard({ p }: { p: Project }) {
  const router = useRouter();
  
  return (
    <Card 
      className="p-6 transition-transform hover:-translate-y-1 hover:cursor-pointer"
      onClick={() => router.push(`/projects/${p.id}`)}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="font-semibold text-lg">{p.name}</h4>
            <Badge variant={statusVariant[p.status] ?? "neutral"}>{p.status}</Badge>
          </div>
          <IconButton 
            icon={<EllipsisHorizontalIcon />} 
            variant="ghost" 
            size="sm" 
            aria-label="Aksi" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <p className="text-sm text-foreground-muted line-clamp-2">
          {p.description}
        </p>
        
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-foreground-muted">Progress</span>
            <span className="text-foreground">{p.progress}%</span>
          </div>
          <ProgressBar value={p.progress} />
        </div>
        
        <div className="flex items-center gap-4 text-xs text-foreground-muted mt-auto pt-4 border-t border-white/[0.02]">
          <span className="text-xs text-foreground-subtle mr-2">{p.version}</span>
          <span className="text-xs text-foreground-subtle mr-2">{p.openIssues} open issues</span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------- */
/*  Lifecycle                                        */
/* ------------------------------------------------- */

function LifecycleFlow({ stages }: { stages: LifecycleStage[] }) {
  return (
    <div className="flex items-start overflow-x-auto py-2">
      {stages.map((stage, i) => (
        <div key={stage.name} className={cn(
          "flex flex-col items-center gap-2 flex-1 min-w-0 relative",
          stage.state === "upcoming" && "opacity-40"
        )}>
          {i > 0 && (
            <div className={cn(
              "absolute top-3 right-1/2 w-full h-[2px] -z-10",
              stage.state === "complete" ? "bg-success" : "bg-white/[0.06]"
            )} />
          )}
          <div className={cn(
            "w-6 h-6 flex items-center justify-center rounded-full bg-background-base z-10",
            stage.state === "complete" ? "text-success" : ""
          )}>
            {stage.state === "complete" ? (
              <CheckCircleSolidIcon className="w-5 h-5" />
            ) : stage.state === "active" ? (
              <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_0_3px_rgba(59,130,246,0.25)] animate-pulse-slow" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full border-2 border-white/[0.1] bg-background-base" />
            )}
          </div>
          <span className={cn(
            "text-xs font-medium text-center whitespace-nowrap",
            stage.state === "active" ? "text-accent-bright font-semibold" : "text-foreground-muted",
            stage.state === "complete" ? "text-success" : ""
          )}>
            {stage.name}
          </span>
          {stage.state === "active" && (
            <span className="text-[10px] text-accent font-semibold -mt-1">{stage.progress}%</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------- */
/*  Active Sprint item                               */
/* ------------------------------------------------- */

const sprintStatusVariant: Record<string, "success" | "warning" | "neutral" | "error" | "accent"> = {
  Active: "accent",
  Planned: "neutral",
  Completed: "success",
  Cancelled: "error",
};

function ActiveSprintItem({ sprint, projectName, projectId, isLast }: { sprint: Sprint; projectName: string; projectId: string; isLast: boolean }) {
  const router = useRouter();
  const isActive = sprint.status === "Active";
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const now = new Date();
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  const timeProgress = totalDuration > 0 ? Math.max(0, Math.min(100, Math.round((elapsed / totalDuration) * 100))) : 0;

  return (
    <div 
      className={cn("p-3 hover:bg-white/[0.02] rounded-xl transition-colors cursor-pointer border border-white/[0.04]", !isLast && "mb-3", isActive && "border-accent/20 bg-accent/[0.02]")}
      onClick={() => router.push(`/projects/${projectId}/kanban`)}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isActive ? "bg-accent shadow-[0_0_0_3px_rgba(59,130,246,0.2)] animate-pulse-slow" : "bg-white/[0.15]"
          )} />
          <p className="text-sm font-semibold truncate">{sprint.name}</p>
        </div>
        <Badge variant={sprintStatusVariant[sprint.status] ?? "neutral"} className="shrink-0 ml-2">{sprint.status}</Badge>
      </div>
      <div className="flex items-center gap-2 text-xs text-foreground-muted mb-2">
        <span className="truncate">{projectName}</span>
        <span className="text-foreground-subtle">&bull;</span>
        <span className="whitespace-nowrap">
          {startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — {endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      </div>
      {sprint.goal && (
        <p className="text-xs text-foreground-subtle line-clamp-1 mb-2">{sprint.goal}</p>
      )}
      {isActive && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-foreground-muted">Timeline</span>
            <span className="text-accent">{timeProgress}%</span>
          </div>
          <ProgressBar value={timeProgress} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------- */
/*  Deadline list                                    */
/* ------------------------------------------------- */

const urgencyVariant: Record<string, "error" | "warning" | "neutral"> = {
  overdue: "error",
  soon: "warning",
  normal: "neutral",
};

function DeadlineItem({ d, isLast }: { d: ComputedDeadline; isLast: boolean }) {
  const router = useRouter();
  
  return (
    <div 
      className={cn("flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer", !isLast && "mb-2")}
      onClick={() => router.push(`/projects/${d.projectId}`)}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-2.5 h-2.5 rounded-full shrink-0",
          {
            "bg-white/[0.1]": d.urgency === "normal",
            "bg-warning shadow-[0_0_0_3px_rgba(249,115,22,0.2)]": d.urgency === "soon",
            "bg-error shadow-[0_0_0_3px_rgba(239,68,68,0.2)] animate-pulse-slow": d.urgency === "overdue"
          }
        )} />
        <div>
          <p className="text-sm font-medium">{d.title}</p>
          <p className="text-xs text-foreground-muted mt-0.5">{d.project}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs text-foreground-muted">
          {new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
        <Badge variant={urgencyVariant[d.urgency] ?? "neutral"}>{d.urgency}</Badge>
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/*  Welcome banner                                   */
/* ------------------------------------------------- */

function WelcomeBanner({ userName }: { userName: string }) {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Selamat malam";
  if (hour >= 5 && hour < 12) greeting = "Selamat pagi";
  else if (hour >= 12 && hour < 17) greeting = "Selamat siang";
  else if (hour >= 17 && hour < 21) greeting = "Selamat sore";

  const displayName = userName || "Developer";

  return (
    <div className="relative overflow-hidden p-8 rounded-2xl bg-background-elevated border border-white/[0.06] mb-8">
      {/* Decorative gradient blob inside banner */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-4xl font-semibold tracking-tight text-gradient-hero mb-2">
          {greeting}, {displayName} 👋
        </h2>
        <p className="text-lg text-foreground-muted">
          Ringkasan seluruh workspace pengembangan kamu.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/*  Dashboard page                                   */
/* ------------------------------------------------- */

export function Dashboard() {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { sprints, fetchSprints } = useSprintStore();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchProjects();
    
    // Fetch user name for greeting
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) setUserName(data.user.name);
      })
      .catch(() => {});
  }, [fetchProjects]);

  // Fetch sprints for all projects once projects are loaded
  useEffect(() => {
    if (projects.length > 0) {
      projects.forEach(p => fetchSprints(p.id));
    }
  }, [projects, fetchSprints]);

  // Compute real data
  const totalOpenIssues = projects.reduce((sum, p) => sum + (p.openIssues || 0), 0);
  const totalIssuesAll = projects.reduce((sum, p) => sum + (p.totalIssues || 0), 0);
  
  const totalDoneIssues = projects.reduce((sum, p) => {
    const pTotal = p.totalIssues || 0;
    const pDone = Math.round((p.progress / 100) * pTotal);
    return sum + pDone;
  }, 0);
  
  const overallProgressPercentage = totalIssuesAll > 0 ? Math.round((totalDoneIssues / totalIssuesAll) * 100) : 0;
  const avgProgress = overallProgressPercentage + "%";

  // Compute deadlines from project data
  const computedDeadlines = computeDeadlines(projects);
  
  // Compute SDLC lifecycle from project data  
  const lifecycle = computeLifecycle(projects);

  // Active & planned sprints across all projects (active first, then planned, sorted by start date)
  const activeSprints = sprints
    .filter(s => s.status === "Active" || s.status === "Planned")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "Active" ? -1 : 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  // Sprint stats
  const totalSprints = sprints.length;
  const activeSprintCount = sprints.filter(s => s.status === "Active").length;
  const completedSprintCount = sprints.filter(s => s.status === "Completed").length;

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <WelcomeBanner userName={userName} />

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active projects" value={projects.length} icon={FolderIcon} iconColor="accent" />
        <StatCard label="Open issues (Backlog)" value={totalOpenIssues} icon={ClipboardDocumentCheckIcon} iconColor="warning" />
        <StatCard label="Upcoming deadlines" value={computedDeadlines.length} icon={ClockIcon} iconColor="error" />
        <StatCard label="Overall progress" value={avgProgress} icon={ChartBarIcon} iconColor="success" />
      </div>

      <Card className="p-8 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold tracking-tight">SDLC Progress</h3>
          <Badge variant="blue">All Projects</Badge>
        </div>
        <LifecycleFlow stages={lifecycle} />
      </Card>

      <div className="section-divider mb-12" />

      {/* Asymmetric layout: 3 columns main, 1 column sidebar on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (col-span-2) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold tracking-tight">Active projects</h3>
              <span className="text-sm text-foreground-muted">{projects.length} projects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
              {projects.length === 0 && (
                <div className="col-span-2 text-center py-12 text-foreground-muted border border-dashed border-white/[0.1] rounded-2xl">
                  No active projects yet.
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold tracking-tight">Active Sprints</h3>
              <span className="text-sm text-foreground-muted">{activeSprints.length} sprints</span>
            </div>
            <Card className="p-6">
              <div className="flex flex-col">
                {activeSprints.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[100px]">
                    <p className="text-foreground-muted text-sm">No active or planned sprints across projects.</p>
                  </div>
                ) : (
                  activeSprints.map((sprint, i) => {
                    const project = projects.find(p => p.id === sprint.projectId);
                    return (
                      <ActiveSprintItem 
                        key={sprint.id} 
                        sprint={sprint} 
                        projectName={project?.name ?? "Unknown"} 
                        projectId={sprint.projectId}
                        isLast={i === activeSprints.length - 1} 
                      />
                    );
                  })
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Sidebar Area (col-span-1) */}
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold tracking-tight mb-6">Upcoming deadlines</h3>
            <Card className="p-6">
              <div className="flex flex-col">
                {computedDeadlines.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[80px]">
                    <p className="text-foreground-muted text-sm">No deadlines set for any project.</p>
                  </div>
                ) : (
                  computedDeadlines.map((d, i) => (
                    <DeadlineItem key={d.id} d={d} isLast={i === computedDeadlines.length - 1} />
                  ))
                )}
              </div>
            </Card>
          </section>

          {/* Sprint & Issues Overview */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold tracking-tight mb-4">Quick Overview</h4>
            <div className="border-t border-white/[0.06] pt-4 mb-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <span className="text-sm text-foreground-muted">Total issues</span>
                <span className="text-sm font-medium text-right">{totalIssuesAll}</span>

                <span className="text-sm text-foreground-muted">Completed issues</span>
                <span className="text-sm font-medium text-right">
                  {totalDoneIssues}
                </span>

                <span className="text-sm text-foreground-muted">Open backlog</span>
                <span className="text-sm font-medium text-right">
                  {totalOpenIssues}
                </span>

                <span className="text-sm text-foreground-muted">Total sprints</span>
                <span className="text-sm font-medium text-right">
                  {totalSprints}
                </span>

                <span className="text-sm text-foreground-muted">Active sprints</span>
                <span className="text-sm font-medium text-right text-accent">
                  {activeSprintCount}
                </span>

                <span className="text-sm text-foreground-muted">Completed sprints</span>
                <span className="text-sm font-medium text-right text-success">
                  {completedSprintCount}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Issues Progress</span>
                <span className="text-xs font-semibold text-accent">
                  {overallProgressPercentage}%
                </span>
              </div>
              <ProgressBar value={overallProgressPercentage} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
