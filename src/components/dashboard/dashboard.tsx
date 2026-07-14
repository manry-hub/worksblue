"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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

import {
  activities,
  deadlines,
  lifecycle,
  type Activity,
  type Deadline,
} from "@/data/dashboard";

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

const urgencyVariant: Record<string, "error" | "warning" | "neutral"> = {
  overdue: "error",
  soon: "warning",
  normal: "neutral",
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
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 24) return <>{diffHours}h ago</>;
  return <>{Math.floor(diffHours / 24)}d ago</>;
}

/* ------------------------------------------------- */
/*  Stat card                                        */
/* ------------------------------------------------- */

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  trendDown,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: "accent" | "warning" | "error" | "success";
  trend?: string;
  trendDown?: boolean;
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
        {trend && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trendDown ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
          )}>
            {trendDown ? <ArrowTrendingDownIcon className="w-3 h-3" /> : <ArrowTrendingUpIcon className="w-3 h-3" />}
            {trend}
          </span>
        )}
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
          <span className="text-xs text-foreground-subtle mr-2">{p.openTasks} open tasks</span>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------- */
/*  Lifecycle                                        */
/* ------------------------------------------------- */

function LifecycleFlow() {
  return (
    <div className="flex items-start overflow-x-auto py-2">
      {lifecycle.map((stage, i) => (
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
/*  Activity list                                    */
/* ------------------------------------------------- */

function ActivityItem({ a, isLast }: { a: Activity; isLast: boolean }) {
  const kindDot: Record<string, string> = {
    task: "bg-success",
    document: "bg-accent",
    release: "bg-accent",
    bug: "bg-error",
  };

  return (
    <div className={cn("flex gap-4 p-2 hover:bg-white/[0.02] rounded-lg transition-colors", !isLast && "mb-2")}>
      <div className="mt-1">
        <div className={cn("w-2 h-2 rounded-full", kindDot[a.kind] || "bg-foreground-muted")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{a.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-foreground-muted">{a.detail}</span>
          <span className="text-xs text-foreground-subtle">&bull;</span>
          <span className="text-xs text-foreground-subtle"><RelativeTime dateString={a.time} /></span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/*  Deadline list                                    */
/* ------------------------------------------------- */

function DeadlineItem({ d, isLast }: { d: Deadline; isLast: boolean }) {
  return (
    <div className={cn("flex items-center justify-between p-2 hover:bg-white/[0.02] rounded-lg transition-colors", !isLast && "mb-2")}>
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

function WelcomeBanner() {
  const now = new Date();
  const hour = now.getHours();
  let greeting = "Selamat malam";
  if (hour >= 5 && hour < 12) greeting = "Selamat pagi";
  else if (hour >= 12 && hour < 17) greeting = "Selamat siang";
  else if (hour >= 17 && hour < 21) greeting = "Selamat sore";

  return (
    <div className="relative overflow-hidden p-8 rounded-2xl bg-background-elevated border border-white/[0.06] mb-8">
      {/* Decorative gradient blob inside banner */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="relative z-10">
        <h2 className="text-4xl font-semibold tracking-tight text-gradient-hero mb-2">
          {greeting}, Developer 👋
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

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const totalOpenTasks = projects.reduce((sum, p) => sum + (p.openTasks || 0), 0);
  const totalTasksAll = projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0);
  
  // Overall progress based on actual done tasks across all projects
  // We can derive done tasks since we have progress % and totalTasks
  const totalDoneTasks = projects.reduce((sum, p) => {
    const pTotal = p.totalTasks || 0;
    const pDone = Math.round((p.progress / 100) * pTotal);
    return sum + pDone;
  }, 0);
  
  const overallProgressPercentage = totalTasksAll > 0 ? Math.round((totalDoneTasks / totalTasksAll) * 100) : 0;
  
  const avgProgress = overallProgressPercentage + "%";

  if (isLoading && projects.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <WelcomeBanner />

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active projects" value={projects.length} icon={FolderIcon} iconColor="accent" trend="+1" />
        <StatCard label="Open tasks (Backlog)" value={totalOpenTasks} icon={ClipboardDocumentCheckIcon} iconColor="warning" trend="-5" trendDown />
        <StatCard label="Upcoming deadlines" value={deadlines.length} icon={ClockIcon} iconColor="error" />
        <StatCard label="Overall progress" value={avgProgress} icon={ChartBarIcon} iconColor="success" trend="+12%" />
      </div>

      <Card className="p-8 mb-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold tracking-tight">SDLC Progress</h3>
          <Badge variant="blue">WorksBlue</Badge>
        </div>
        <LifecycleFlow />
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
            <h3 className="text-2xl font-semibold tracking-tight mb-6">Recent activity</h3>
            <Card className="p-6">
              <div className="flex flex-col">
                {activities.map((a, i) => (
                  <ActivityItem key={a.id} a={a} isLast={i === activities.length - 1} />
                ))}
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
                {deadlines.map((d, i) => (
                  <DeadlineItem key={d.id} d={d} isLast={i === deadlines.length - 1} />
                ))}
              </div>
            </Card>
          </section>

          <Card className="p-6">
            <h4 className="text-lg font-semibold tracking-tight mb-4">Quick overview</h4>
            <div className="border-t border-white/[0.06] pt-4 mb-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <span className="text-sm text-foreground-muted">Total tasks</span>
                <span className="text-sm font-medium text-right">{totalTasksAll}</span>

                <span className="text-sm text-foreground-muted">Completed tasks</span>
                <span className="text-sm font-medium text-right">
                  {totalDoneTasks}
                </span>

                <span className="text-sm text-foreground-muted">Open backlog</span>
                <span className="text-sm font-medium text-right">
                  {totalOpenTasks}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-foreground-muted uppercase tracking-wider font-mono">Overall Progress</span>
                <span className="text-xs font-semibold text-accent">
                  {overallProgressPercentage}%
                </span>
              </div>
              <ProgressBar
                value={overallProgressPercentage}
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
