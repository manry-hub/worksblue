"use client";

import { useEffect, useState, use } from "react";
import { useSprintStore } from "@/store/sprint-store";
import { useIssueStore, type Issue } from "@/store/issue-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { 
  ClipboardDocumentCheckIcon, 
  RocketLaunchIcon, 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FlagIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  Bars3Icon,
  AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import { DocumentTextIcon, BugAntIcon, CheckBadgeIcon } from "@heroicons/react/24/solid";
import { IssueDetailsModal } from "@/components/kanban/issue-details-modal";
import { CreateSprintModal } from "@/components/backlog/create-sprint-modal";
import { EditSprintModal } from "@/components/backlog/edit-sprint-modal";
import { BacklogBoard, SprintWithIssues } from "@/components/backlog/backlog-board";
import { format } from "date-fns";

type SprintStatus = "Planned" | "Active" | "Completed" | "Cancelled";

export default function BacklogPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const projectId = params.id;
  
  const { sprints, fetchSprints, startSprint, completeSprint, cancelSprint, deleteSprint, updateSprint } = useSprintStore();
  const { issues, fetchIssues, updateIssue, deleteIssue, isLoading: issuesLoading } = useIssueStore();
  
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateIssueModalOpen, setIsCreateIssueModalOpen] = useState(false);
  const [isCreateSprintModalOpen, setIsCreateSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<SprintWithIssues | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<"all" | "hilman" | "others">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSprints, setExpandedSprints] = useState<Set<string>>(new Set());
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const [bulkActionMode, setBulkActionMode] = useState(false);

  useEffect(() => {
    fetchSprints(projectId);
    fetchIssues(projectId);
  }, [fetchSprints, fetchIssues, projectId]);

  useEffect(() => {
    const initialExpanded = new Set<string>();
    sprints.forEach(s => {
      if (s.status === "Active" || s.status === "Planned") {
        initialExpanded.add(s.id);
      }
    });
    setExpandedSprints(initialExpanded);
  }, [sprints]);

  const filterIssues = (issueList: Issue[]) => {
    return issueList.filter(i => {
      const assignee = (i.assignee || "hilman").toLowerCase();
      if (filterAssignee === "hilman" && assignee !== "hilman") return false;
      if (filterAssignee === "others" && assignee === "hilman") return false;
      if (searchQuery && !(i.title || "").toLowerCase().includes(searchQuery.toLowerCase()) && 
          !(i.description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  };

  const sprintsWithIssues: SprintWithIssues[] = sprints.map(sprint => ({
    ...sprint,
    issues: filterIssues(issues.filter(i => i.sprintId === sprint.id))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  })).sort((a, b) => {
    const statusOrder: Record<SprintStatus, number> = { Active: 0, Planned: 1, Completed: 2, Cancelled: 3 };
    return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
  });

  const backlogIssues = issues.filter(i => !i.sprintId);

  const filteredBacklogIssues = filterIssues(backlogIssues);

  const toggleIssueSelection = (issueId: string) => {
    setSelectedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) next.delete(issueId);
      else next.add(issueId);
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIssueIds(new Set());
    setBulkActionMode(false);
  };

  const handleBulkMoveToSprint = async (targetSprintId: string) => {
    if (selectedIssueIds.size === 0) return;
    await Promise.all(
      Array.from(selectedIssueIds).map(issueId => {
        if (targetSprintId === "backlog") {
          return updateIssue(projectId, issueId, { sprintId: null, status: "backlog", updatedAt: new Date().toISOString() });
        } else {
          return updateIssue(projectId, issueId, { sprintId: targetSprintId, status: "todo", updatedAt: new Date().toISOString() });
        }
      })
    );
    clearSelection();
  };

  const handleMoveIssue = async (issueId: string, targetSprintId: string) => {
    if (targetSprintId === "backlog") {
      await updateIssue(projectId, issueId, { sprintId: null, status: "backlog", updatedAt: new Date().toISOString() });
    } else {
      await updateIssue(projectId, issueId, { sprintId: targetSprintId, status: "todo", updatedAt: new Date().toISOString() });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIssueIds.size === 0) return;
    if (!confirm(`Delete ${selectedIssueIds.size} issues?`)) return;
    await Promise.all(
      Array.from(selectedIssueIds).map(issueId => deleteIssue(projectId, issueId))
    );
    clearSelection();
  };

  const handleBulkSetPriority = async (priority: string) => {
    if (selectedIssueIds.size === 0) return;
    await Promise.all(
      Array.from(selectedIssueIds).map(issueId => 
        updateIssue(projectId, issueId, { priority, updatedAt: new Date().toISOString() })
      )
    );
    clearSelection();
  };

  const handleStartSprint = async (sprintId: string) => {
    await startSprint(projectId, sprintId);
  };

  const handleCompleteSprint = async (sprintId: string) => {
    await completeSprint(projectId, sprintId);
  };

  const handleCancelSprint = async (sprintId: string) => {
    if (confirm("Cancel this sprint? Issues will return to backlog.")) {
      await cancelSprint(projectId, sprintId);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (confirm("Delete this sprint? This cannot be undone.")) {
      await deleteSprint(projectId, sprintId);
    }
  };

  const handleEditSprint = (sprint: SprintWithIssues) => {
    setEditingSprint(sprint);
  };

  const toggleSprintExpanded = (sprintId: string) => {
    setExpandedSprints(prev => {
      const next = new Set(prev);
      if (next.has(sprintId)) next.delete(sprintId);
      else next.add(sprintId);
      return next;
    });
  };

  const sendToBoard = async (e: React.MouseEvent, issue: Issue) => {
    e.stopPropagation();
    await updateIssue(projectId, issue.id, { status: "todo", updatedAt: new Date().toISOString() });
  };

  const handleDeleteIssue = async (e: React.MouseEvent, issue: Issue) => {
    e.stopPropagation();
    if (confirm("Delete this issue?")) {
      await deleteIssue(projectId, issue.id);
    }
  };

  const getStatusColor = (status: SprintStatus) => {
    switch (status) {
      case "Planned": return "neutral";
      case "Active": return "accent";
      case "Completed": return "success";
      case "Cancelled": return "error";
      default: return "neutral";
    }
  };

  const getStatusIcon = (status: SprintStatus) => {
    switch (status) {
      case "Planned": return <FlagIcon className="w-4 h-4" />;
      case "Active": return <PlayIcon className="w-4 h-4" />;
      case "Completed": return <CheckCircleIcon className="w-4 h-4" />;
      case "Cancelled": return <XCircleIcon className="w-4 h-4" />;
      default: return <FlagIcon className="w-4 h-4" />;
    }
  };

  const getIssueIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("bug") || t.includes("fix") || t.includes("error")) {
      return <div className="w-4 h-4 rounded-[3px] bg-[#E5493A] flex items-center justify-center flex-shrink-0 text-white"><BugAntIcon className="w-3 h-3" /></div>;
    }
    if (t.includes("feature") || t.includes("story") || t.includes("add")) {
      return <div className="w-4 h-4 rounded-[3px] bg-[#57A55A] flex items-center justify-center flex-shrink-0 text-white"><DocumentTextIcon className="w-3 h-3" /></div>;
    }
    return <div className="w-4 h-4 rounded-[3px] bg-[#4BADE8] flex items-center justify-center flex-shrink-0 text-white"><CheckBadgeIcon className="w-3 h-3" /></div>;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "todo": return <span className="bg-[#DFE1E6]/10 text-[#DFE1E6] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">TO DO ⌄</span>;
      case "in-progress":
      case "inprogress":
      case "in progress": return <span className="bg-[#0052CC]/30 text-[#4BADE8] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">IN PROGRESS ⌄</span>;
      case "in-review":
      case "in review":
      case "review": return <span className="bg-[#FF991F]/20 text-[#FF991F] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">IN REVIEW ⌄</span>;
      case "done": return <span className="bg-[#00875A]/20 text-[#57A55A] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">DONE ⌄</span>;
      case "cancelled": return <span className="bg-[#E5493A]/20 text-[#E5493A] text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">CANCELLED ⌄</span>;
      default: return <span className="bg-white/10 text-white text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{status} ⌄</span>;
    }
  };

  if (issuesLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center text-sm text-foreground-muted gap-2">
          <span>Projects</span>
          <span>/</span>
          <span>Scrumban Project</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-[#DEE4EA]">Backlog</h2>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search backlog"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border border-white/20 rounded-md pl-9 pr-3 py-1.5 text-foreground placeholder:text-foreground-muted focus:outline-none focus:border-accent w-48 transition-colors"
            />
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
          <Button variant="ghost" size="sm" className="h-8 text-foreground-muted hover:bg-white/5 border border-white/10" icon={<AdjustmentsHorizontalIcon className="w-4 h-4"/>}>
            Filter
          </Button>
        </div>
      </div>

      <BacklogBoard
        sprintsWithIssues={sprintsWithIssues}
        filteredBacklogIssues={filteredBacklogIssues}
        allIssues={issues}
        expandedSprints={expandedSprints}
        toggleSprintExpanded={toggleSprintExpanded}
        selectedIssueIds={selectedIssueIds}
        toggleIssueSelection={toggleIssueSelection}
        setSelectedIssue={setSelectedIssue}
        handleDeleteIssue={handleDeleteIssue}
        handleMoveIssue={handleMoveIssue}
        setIsCreateIssueModalOpen={setIsCreateIssueModalOpen}
        setIsCreateSprintModalOpen={setIsCreateSprintModalOpen}
        handleStartSprint={handleStartSprint}
        handleCompleteSprint={handleCompleteSprint}
        handleEditSprint={handleEditSprint}
        handleDeleteSprint={handleDeleteSprint}
        onDragEnd={async (issueId, targetSprintId) => {
          if (targetSprintId === "backlog" || targetSprintId === null) {
            await updateIssue(projectId, issueId, { sprintId: null, status: "backlog", updatedAt: new Date().toISOString() });
          } else {
            await updateIssue(projectId, issueId, { sprintId: targetSprintId, status: "todo", updatedAt: new Date().toISOString() });
          }
        }}
      />

      {bulkActionMode && selectedIssueIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background-elevated border-t border-white/10 p-4 shadow-xl z-50 animate-slide-up">
          <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedIssueIds.size} issues selected</span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>Clear</Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                onChange={(e) => { if (e.target.value) handleBulkMoveToSprint(e.target.value); }}
                defaultValue=""
              >
                <option value="">Move to Sprint...</option>
                <option value="backlog">Backlog</option>
                {sprintsWithIssues
                  .filter(s => s.status === "Planned" || s.status === "Active")
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                  ))}
              </select>
              <select
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                onChange={(e) => { if (e.target.value) handleBulkSetPriority(e.target.value as "low" | "medium" | "high"); }}
                defaultValue=""
              >
                <option value="">Set Priority...</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <Button variant="ghost" size="sm" icon={<TrashIcon className="w-3 h-3" />} className="text-error hover:bg-error/10" onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      <IssueDetailsModal 
        isOpen={selectedIssue !== null}
        onClose={() => setSelectedIssue(null)}
        issue={selectedIssue}
        projectId={projectId}
        mode="edit"
      />
      
      <IssueDetailsModal 
        isOpen={isCreateIssueModalOpen}
        onClose={() => setIsCreateIssueModalOpen(false)}
        issue={null}
        projectId={projectId}
        mode="create"
      />

      <CreateSprintModal 
        isOpen={isCreateSprintModalOpen} 
        onClose={() => setIsCreateSprintModalOpen(false)} 
        projectId={projectId} 
      />

      <EditSprintModal
        isOpen={!!editingSprint}
        onClose={() => setEditingSprint(null)}
        sprint={editingSprint}
        projectId={projectId}
      />
    </div>
  );
}