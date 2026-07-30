"use client";

import { use, useState } from "react";
import { useSprintStore } from "@/store/sprint-store";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CreateIssueModal } from "@/components/kanban/create-issue-modal";
import { IssueDetailsModal } from "@/components/kanban/issue-details-modal";
import { IssueStatus, type Issue } from "@/store/issue-store";
import { Button } from "@/components/ui/button";
import { PlusIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function KanbanPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  
  const { sprints, fetchSprints } = useSprintStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalStatus, setCreateModalStatus] = useState<IssueStatus>("todo");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<"all" | "hilman" | "others">("all");
  const [selectedSprintId, setSelectedSprintId] = useState<string | "none">("none");
  const [isSprintSelectorOpen, setIsSprintSelectorOpen] = useState(false);

  // Fetch sprints on mount
  const { sprints: sprintsList } = useSprintStore();
  
  // Get active sprint
  const activeSprint = sprintsList.find(s => s.status === "Active" && s.projectId === projectId);

  // Sprint options for selector
  const sprintOptions = sprintsList
    .filter(s => s.projectId === projectId && (s.status === "Active" || s.status === "Planned"))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenCreateModal = (status: IssueStatus = "todo") => {
    setCreateModalStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center text-sm text-foreground-muted gap-2">
          <span>Projects</span>
          <span>/</span>
          <span>Scrumban Project</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-[#DEE4EA]">Kanban Board</h2>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          {/* Sprint Selector */}
          <div className="relative z-20">
            <button
              onClick={() => setIsSprintSelectorOpen(!isSprintSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-white/20 rounded-md text-foreground hover:bg-white/[0.05] transition-colors h-8"
            >
              <span className="font-medium text-sm text-[#DEE4EA]">
                {selectedSprintId === "none" 
                  ? (activeSprint ? `📋 ${activeSprint.name}` : "All Issues (No Sprint)") 
                  : sprintOptions.find(s => s.id === selectedSprintId)?.name || "All Issues"
                }
              </span>
              <ChevronDownIcon className={`w-3.5 h-3.5 text-foreground-muted transition-transform ${isSprintSelectorOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSprintSelectorOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsSprintSelectorOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-64 bg-[#22272B] border border-white/[0.08] rounded-md shadow-lg py-1 z-20">
                  <button
                    onClick={() => { setSelectedSprintId("none"); setIsSprintSelectorOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-white/5 transition-colors text-[#DEE4EA] ${selectedSprintId === "none" ? "bg-accent/10 text-accent border-l-2 border-accent" : ""}`}
                  >
                    All Issues (No Sprint)
                  </button>
                  <hr className="border-white/[0.08] my-1" />
                  {sprintOptions.map(sprint => (
                    <button
                      key={sprint.id}
                      onClick={() => { setSelectedSprintId(sprint.id); setIsSprintSelectorOpen(false); }}
                      className={`w-full px-3 py-1.5 text-left text-sm hover:bg-white/5 transition-colors ${selectedSprintId === sprint.id ? "bg-accent/10 text-accent border-l-2 border-accent" : "text-[#DEE4EA]"}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{sprint.name}</span>
                        <span className="text-[10px] uppercase font-bold text-foreground-muted">{sprint.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex -space-x-2">
            <button 
              onClick={() => setFilterAssignee(filterAssignee === "hilman" ? "all" : "hilman")}
              className={`w-7 h-7 rounded-full bg-blue-600 border-2 ${filterAssignee === "hilman" ? "border-accent ring-2 ring-accent scale-110" : "border-background"} flex items-center justify-center text-xs font-bold text-white z-10 transition-all`}
              title="Filter by Hilman"
            >
              H
            </button>
            <button 
              onClick={() => setFilterAssignee(filterAssignee === "others" ? "all" : "others")}
              className={`w-7 h-7 rounded-full bg-purple-600 border-2 ${filterAssignee === "others" ? "border-accent ring-2 ring-accent scale-110" : "border-background"} flex items-center justify-center text-xs font-bold text-white z-0 transition-all`}
              title="Filter by Others"
            >
              M
            </button>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 text-foreground-muted hover:bg-white/5 border border-white/10" onClick={() => handleOpenCreateModal("todo")}>
            New issue
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard 
          projectId={projectId} 
          onAddIssue={handleOpenCreateModal} 
          onIssueClick={(issue) => setSelectedIssue(issue)} 
          filterAssignee={filterAssignee}
          sprintId={selectedSprintId === "none" ? undefined : selectedSprintId}
        />
      </div>

      <CreateIssueModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        projectId={projectId} 
        initialStatus={createModalStatus} 
        sprintId={selectedSprintId === "none" ? undefined : selectedSprintId}
      />

      <IssueDetailsModal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        projectId={projectId}
        issue={selectedIssue}
      />
    </div>
  );
}