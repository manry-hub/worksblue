"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, FolderIcon, TicketIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useProjectStore } from "@/store/project-store";
import { Badge } from "@/components/ui/badge";

type SdlcMatch = {
  id: string;
  projectId: string;
  projectName: string;
  phase: "Planning" | "Requirements" | "System Design" | "Testing" | "Deployment";
  title: string;
  snippet?: string;
  url: string;
};

export function CommandPaletteSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [searchedTasks, setSearchedTasks] = useState<any[]>([]);
  const [isSearchingTasks, setIsSearchingTasks] = useState(false);
  
  const router = useRouter();
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load projects if not loaded
  useEffect(() => {
    if (isOpen && projects.length === 0) {
      fetchProjects();
    }
  }, [isOpen, projects.length, fetchProjects]);

  // Debounce the search query for tasks
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch tasks when debounced query changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (!debouncedQuery.trim()) {
        setSearchedTasks([]);
        return;
      }
      setIsSearchingTasks(true);
      try {
        const res = await fetch(`/api/search/tasks?q=${encodeURIComponent(debouncedQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchedTasks(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      } finally {
        setIsSearchingTasks(false);
      }
    };

    fetchTasks();
  }, [debouncedQuery]);

  // 1. Filter Projects
  const filteredProjects = projects.filter((p) => {
    const query = searchQuery.toLowerCase();
    if (!query.trim()) return false;
    return (
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      p.status.toLowerCase().includes(query)
    );
  });

  // 2. Filter SDLC Data
  const matchedSdlcData: SdlcMatch[] = [];
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    projects.forEach((p) => {
      // Planning
      if (p.problemStatement?.toLowerCase().includes(query) || p.objective?.toLowerCase().includes(query)) {
        matchedSdlcData.push({
          id: `${p.id}-planning`,
          projectId: p.id,
          projectName: p.name,
          phase: "Planning",
          title: "Match in Problem Statement / Objective",
          url: `/projects/${p.id}/planning`,
        });
      }

      // Requirements
      if (p.requirements) {
        const allReqs = [
          ...(p.requirements.functional || []),
          ...(p.requirements.nonFunctional || []),
          ...(p.requirements.externalInterface || []),
        ];
        allReqs.forEach((req) => {
          if (
            req.requirement.toLowerCase().includes(query) ||
            req.description?.toLowerCase().includes(query)
          ) {
            matchedSdlcData.push({
              id: req.id,
              projectId: p.id,
              projectName: p.name,
              phase: "Requirements",
              title: req.requirement,
              snippet: req.description,
              url: `/projects/${p.id}/requirements`,
            });
          }
        });
      }

      // System Design
      if (p.design) {
        p.design.apiDesign?.forEach((api) => {
          if (api.path.toLowerCase().includes(query) || api.action.toLowerCase().includes(query)) {
            matchedSdlcData.push({
              id: api.id,
              projectId: p.id,
              projectName: p.name,
              phase: "System Design",
              title: `${api.verb} ${api.path}`,
              snippet: api.action,
              url: `/projects/${p.id}/design`,
            });
          }
        });
        p.design.techSpecs?.forEach((tech) => {
          if (tech.name.toLowerCase().includes(query) || tech.need.toLowerCase().includes(query)) {
            matchedSdlcData.push({
              id: tech.id,
              projectId: p.id,
              projectName: p.name,
              phase: "System Design",
              title: tech.name,
              snippet: tech.need,
              url: `/projects/${p.id}/design`,
            });
          }
        });
      }

      // Testing
      p.testCases?.forEach((tc) => {
        if (
          tc.testCaseId.toLowerCase().includes(query) ||
          tc.testSteps.toLowerCase().includes(query) ||
          tc.expectedResult.toLowerCase().includes(query)
        ) {
          matchedSdlcData.push({
            id: tc.id,
            projectId: p.id,
            projectName: p.name,
            phase: "Testing",
            title: tc.testCaseId,
            snippet: tc.expectedResult,
            url: `/projects/${p.id}/testing`,
          });
        }
      });

      // Deployment
      if (p.deployment) {
        if (p.deployment.platform?.toLowerCase().includes(query)) {
          matchedSdlcData.push({
            id: `${p.id}-deployment-platform`,
            projectId: p.id,
            projectName: p.name,
            phase: "Deployment",
            title: "Match in Platform Details",
            url: `/projects/${p.id}/deployment`,
          });
        }
      }
    });
  }

  // Cap SDLC results to avoid overwhelming UI
  const finalSdlcData = matchedSdlcData.slice(0, 10);

  const totalResults = filteredProjects.length + searchedTasks.length + finalSdlcData.length;

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, searchedTasks.length, finalSdlcData.length]);

  // Handle keyboard navigation globally when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < totalResults - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex < filteredProjects.length) {
          handleSelectProject(filteredProjects[selectedIndex].id);
        } else if (selectedIndex < filteredProjects.length + finalSdlcData.length) {
          const sdlcIndex = selectedIndex - filteredProjects.length;
          handleSelectSdlc(finalSdlcData[sdlcIndex]);
        } else {
          const taskIndex = selectedIndex - filteredProjects.length - finalSdlcData.length;
          if (searchedTasks[taskIndex]) {
            handleSelectTask(searchedTasks[taskIndex]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredProjects, finalSdlcData, searchedTasks, selectedIndex, totalResults]);

  // Global keyboard shortcut to open palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleSelectProject = (projectId: string) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(`/projects/${projectId}`);
  };

  const handleSelectSdlc = (match: SdlcMatch) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(match.url);
  };
  
  const handleSelectTask = (task: any) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(`/projects/${task.projectId}/backlog`);
  };

  return (
    <>
      <button
        className="command-trigger w-full max-w-full justify-between"
        type="button"
        aria-label="Search projects and docs"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-2">
          <MagnifyingGlassIcon className="w-4 h-4 text-foreground-muted" />
          <span className="text-foreground-subtle">Search projects, docs & issues...</span>
        </div>
       
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-background-base/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="relative w-full max-w-2xl bg-background-elevated border border-white/[0.06] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(59,130,246,0.1)] overflow-hidden animate-fade-in-up flex flex-col max-h-[70vh]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <MagnifyingGlassIcon className="w-5 h-5 text-accent" />
              <input 
                ref={inputRef}
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-foreground-subtle"
                placeholder="Search across all projects, SDLC phases, and issues..."
              />
              {isSearchingTasks && (
                <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin mr-2" />
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-foreground-subtle hover:text-foreground border border-white/[0.06] rounded px-2 py-1 shrink-0"
              >
                ESC
              </button>
            </div>
            
            <div className="overflow-y-auto p-2">
              {!searchQuery.trim() ? (
                <div className="p-12 text-center text-sm text-foreground-muted">
                  Type to start searching...
                </div>
              ) : totalResults === 0 && !isSearchingTasks ? (
                <div className="p-12 text-center text-sm text-foreground-muted">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Projects */}
                  {filteredProjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                        Projects
                      </div>
                      {filteredProjects.map((project, index) => {
                        const isSelected = index === selectedIndex;
                        return (
                          <button
                            key={project.id}
                            onClick={() => handleSelectProject(project.id)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                              isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                            }`}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-accent/20 text-accent-bright' : 'bg-white/5 text-foreground-muted'}`}>
                                <FolderIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                                {project.description && (
                                  <p className="text-xs text-foreground-subtle truncate mt-0.5">{project.description}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant="neutral" className="ml-4 shrink-0">{project.status}</Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* SDLC Data */}
                  {finalSdlcData.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                        SDLC Phases & Docs
                      </div>
                      {finalSdlcData.map((match, index) => {
                        const globalIndex = filteredProjects.length + index;
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={match.id}
                            onClick={() => handleSelectSdlc(match)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                              isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                            }`}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-foreground-muted'}`}>
                                <DocumentTextIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground truncate">{match.title}</p>
                                </div>
                                <p className="text-xs text-foreground-subtle truncate mt-0.5">
                                  {match.snippet && <span className="text-foreground-muted mr-2">"{match.snippet}"</span>}
                                  in <span className="font-medium text-indigo-300">{match.projectName}</span> &rsaquo; {match.phase}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Issues */}
                  {searchedTasks.length > 0 && (
                    <div className="space-y-1">
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">
                        Issues & Tasks
                      </div>
                      {searchedTasks.map((task, index) => {
                        const globalIndex = filteredProjects.length + finalSdlcData.length + index;
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={task.id}
                            onClick={() => handleSelectTask(task)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-colors ${
                              isSelected ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'
                            }`}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-warning/20 text-warning' : 'bg-white/5 text-foreground-muted'}`}>
                                <TicketIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-foreground-muted shrink-0">{task.id}</span>
                                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                                </div>
                                <p className="text-xs text-foreground-subtle truncate mt-0.5">
                                  in <span className="font-medium text-warning-muted">{task.projectName}</span>
                                </p>
                              </div>
                            </div>
                            <Badge variant={task.status === "done" ? "success" : "neutral"} className="ml-4 shrink-0">{task.status}</Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
