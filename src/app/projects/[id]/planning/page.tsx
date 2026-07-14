"use client";

import { use, useEffect, useState } from "react";
import { useProjectStore, type Project } from "@/store/project-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, XMarkIcon, CalendarIcon, DocumentTextIcon, UsersIcon, CommandLineIcon, FlagIcon } from "@heroicons/react/24/outline";

export default function PlanningPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  const { getProject, updateProject, fetchProjects } = useProjectStore();
  const project = getProject(projectId);

  const [problemStatement, setProblemStatement] = useState("");
  const [objective, setObjective] = useState("");
  
  const [stakeholders, setStakeholders] = useState<string[]>([]);
  const [newStakeholder, setNewStakeholder] = useState("");

  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!project) {
      fetchProjects();
    } else {
      setProblemStatement(project.problemStatement || "");
      setObjective(project.objective || "");
      setStakeholders(project.stakeholders || []);
      setTechStack(project.techStack || []);
      if (project.timeline) {
        setStartDate(project.timeline.startDate || "");
        setEndDate(project.timeline.endDate || "");
      }
    }
  }, [project, fetchProjects]);

  const saveChanges = async (updates: Partial<Project>) => {
    if (!project) return;
    await updateProject(projectId, updates);
  };

  const handleBlurText = () => {
    if (project?.problemStatement !== problemStatement || project?.objective !== objective) {
      saveChanges({ problemStatement, objective });
    }
  };

  const addStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStakeholder.trim() || stakeholders.includes(newStakeholder.trim())) return;
    const updated = [...stakeholders, newStakeholder.trim()];
    setStakeholders(updated);
    setNewStakeholder("");
    saveChanges({ stakeholders: updated });
  };

  const removeStakeholder = (s: string) => {
    const updated = stakeholders.filter(x => x !== s);
    setStakeholders(updated);
    saveChanges({ stakeholders: updated });
  };

  const addTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTech.trim() || techStack.includes(newTech.trim())) return;
    const updated = [...techStack, newTech.trim()];
    setTechStack(updated);
    setNewTech("");
    saveChanges({ techStack: updated });
  };

  const removeTech = (t: string) => {
    const updated = techStack.filter(x => x !== t);
    setTechStack(updated);
    saveChanges({ techStack: updated });
  };

  const updateTimelineDates = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    saveChanges({ timeline: { startDate: start, endDate: end } });
  };

  if (!project) return <div className="p-8 text-center text-foreground-muted">Loading project...</div>;

  return (
    <div className="h-full max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-hero">Planning Phase</h2>
        <p className="text-foreground-muted mt-1">Define the foundation, goals, and timeline of your project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-background-elevated/40 backdrop-blur-sm border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <DocumentTextIcon className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-medium text-foreground">Problem Statement</h3>
            </div>
            <textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              onBlur={handleBlurText}
              placeholder="What specific problem does this project solve? e.g. Users currently have to manually sync data between 3 different platforms..."
              className="w-full min-h-[120px] bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.04] transition-all resize-y"
            />
          </Card>

          <Card className="p-6 bg-background-elevated/40 backdrop-blur-sm border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <FlagIcon className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-medium text-foreground">Objective</h3>
            </div>
            <textarea
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              onBlur={handleBlurText}
              placeholder="What are the key goals and desired outcomes? e.g. Centralize data syncing to save 5 hours per week per user..."
              className="w-full min-h-[120px] bg-white/[0.02] border border-white/10 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.04] transition-all resize-y"
            />
          </Card>

          <Card className="p-6 bg-background-elevated/40 backdrop-blur-sm border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-medium text-foreground">Project Timeline</h3>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => updateTimelineDates(e.target.value, endDate)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.04] transition-all"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-foreground-muted mb-1">Target End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => updateTimelineDates(startDate, e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-lg p-2.5 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:bg-white/[0.04] transition-all"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="p-6 bg-background-elevated/40 backdrop-blur-sm border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-foreground">Stakeholders</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {stakeholders.length === 0 && <span className="text-sm text-foreground-muted italic">No stakeholders added</span>}
              {stakeholders.map(s => (
                <div key={s} className="flex items-center gap-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full text-xs font-medium">
                  {s}
                  <button onClick={() => removeStakeholder(s)} className="hover:text-white ml-1">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addStakeholder} className="flex gap-2">
              <input 
                type="text" 
                value={newStakeholder}
                onChange={(e) => setNewStakeholder(e.target.value)}
                placeholder="Name or role..."
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-accent/50"
              />
              <Button type="submit" variant="secondary" className="px-3">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-background-elevated/40 backdrop-blur-sm border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <CommandLineIcon className="w-5 h-5 text-sky-400" />
              <h3 className="text-lg font-medium text-foreground">Tech Stack</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {techStack.length === 0 && <span className="text-sm text-foreground-muted italic">No technologies added</span>}
              {techStack.map(t => (
                <div key={t} className="flex items-center gap-1 bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-mono">
                  {t}
                  <button onClick={() => removeTech(t)} className="hover:text-white ml-1">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={addTech} className="flex gap-2">
              <input 
                type="text" 
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="e.g. Next.js, Postgres..."
                className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg p-2 text-sm text-foreground focus:outline-none focus:border-accent/50"
              />
              <Button type="submit" variant="secondary" className="px-3">
                <PlusIcon className="w-4 h-4" />
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
