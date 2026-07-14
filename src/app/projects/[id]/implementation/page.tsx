"use client";

import { use, useEffect } from "react";
import { useProjectStore } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { CheckCircleIcon, CheckIcon } from "@heroicons/react/24/outline";

const IMPLEMENTATION_TASKS = [
  {
    id: "1",
    title: "Project Initialization",
    subtasks: [
      { id: "1.1", label: "Framework setup" },
      { id: "1.2", label: "Development environment" },
      { id: "1.3", label: "Project configuration" },
    ]
  },
  {
    id: "2",
    title: "Database Structure Implementation",
    subtasks: [
      { id: "2.1", label: "Complete database implementation" }
    ]
  },
  {
    id: "3",
    title: "API Implementation",
    subtasks: [
      { id: "3.1", label: "Endpoint implementation" },
      { id: "3.2", label: "Request & response handling" },
      { id: "3.3", label: "Validation" },
    ]
  },
  {
    id: "4",
    title: "Authentication & Authorization",
    subtasks: [
      { id: "4.1", label: "Authentication mechanism" },
      { id: "4.2", label: "Authorization mechanism" },
      { id: "4.3", label: "Session management" },
      { id: "4.4", label: "Route protection" },
    ]
  },
  {
    id: "5",
    title: "Feature Implementation",
    subtasks: [
      { id: "5.1", label: "Complete feature implementation" }
    ]
  },
  {
    id: "6",
    title: "Testing & Debugging",
    subtasks: [
      { id: "6.1", label: "Test Case" },
      { id: "6.2", label: "Bug Fixing" },
    ]
  },
  {
    id: "7",
    title: "Deployment",
    subtasks: [
      { id: "7.1", label: "Build process" },
      { id: "7.2", label: "Environment configuration" },
      { id: "7.3", label: "Production deployment" },
    ]
  }
];

export default function ImplementationPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  useEffect(() => {
    if (!project) {
      fetchProjects();
    }
  }, [project, fetchProjects]);

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  const tasksState = project.implementationTasks || {};

  const toggleTask = (taskId: string) => {
    const newState = { ...tasksState, [taskId]: !tasksState[taskId] };
    updateProject(projectId, { implementationTasks: newState });
  };

  const getPhaseProgress = (phase: typeof IMPLEMENTATION_TASKS[0]) => {
    const total = phase.subtasks.length;
    if (total === 0) return 0;
    const completed = phase.subtasks.filter(t => tasksState[t.id]).length;
    return Math.round((completed / total) * 100);
  };

  const totalProgress = Math.round(
    (IMPLEMENTATION_TASKS.reduce((acc, phase) => acc + phase.subtasks.filter(t => tasksState[t.id]).length, 0) / 
    IMPLEMENTATION_TASKS.reduce((acc, phase) => acc + phase.subtasks.length, 0)) * 100
  );

  return (
    <div className="h-full max-w-5xl mx-auto pb-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Implementation Phase</h2>
          <p className="text-foreground-muted mt-2">Track the development progress of the system.</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-6 min-w-[250px]">
          <div>
            <div className="text-sm font-medium text-foreground-muted mb-1">Total Progress</div>
            <div className="text-3xl font-bold text-accent">{totalProgress}%</div>
          </div>
          <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${totalProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Connection line for desktop */}
        <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-accent/0 via-accent/20 to-accent/0 -translate-x-1/2"></div>
        
        {IMPLEMENTATION_TASKS.map((phase, index) => {
          const progress = getPhaseProgress(phase);
          const isComplete = progress === 100;
          
          return (
            <Card 
              key={phase.id} 
              className={`relative overflow-hidden transition-all duration-300 ${
                isComplete 
                  ? "bg-accent/5 border-accent/30 shadow-[0_0_30px_rgba(37,99,235,0.1)]" 
                  : "bg-background-elevated/40 backdrop-blur-sm border-white/5 hover:border-white/10"
              }`}
            >
              {isComplete && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] -mr-10 -mt-10 pointer-events-none"></div>
              )}
              
              <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      isComplete ? "bg-accent text-white shadow-lg shadow-accent/25" : "bg-white/10 text-foreground-muted"
                    }`}>
                      {phase.id}
                    </div>
                    <h3 className={`text-lg font-medium ${isComplete ? "text-accent-light" : "text-foreground"}`}>
                      {phase.title}
                    </h3>
                  </div>
                  {isComplete && (
                    <CheckCircleIcon className="w-6 h-6 text-accent animate-in zoom-in" />
                  )}
                </div>
                
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? "bg-accent" : "bg-white/20"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-foreground-muted w-10 text-right">
                    {progress}%
                  </span>
                </div>
              </div>
              
              <div className="p-6 bg-black/10">
                <div className="space-y-3">
                  {phase.subtasks.map(task => {
                    const isChecked = tasksState[task.id] || false;
                    return (
                      <label 
                        key={task.id}
                        className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all border ${
                          isChecked 
                            ? "bg-accent/10 border-accent/20" 
                            : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/5"
                        }`}
                      >
                        <div className={`relative w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                          isChecked 
                            ? "bg-accent border-accent text-white" 
                            : "bg-black/50 border-white/20 text-transparent"
                        }`}>
                          <input 
                            type="checkbox" 
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => toggleTask(task.id)}
                          />
                          <CheckIcon className={`w-3.5 h-3.5 transition-transform ${isChecked ? "scale-100" : "scale-0"}`} strokeWidth={3} />
                        </div>
                        <span className={`text-sm font-medium transition-colors ${
                          isChecked ? "text-foreground" : "text-foreground-muted"
                        }`}>
                          {task.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
