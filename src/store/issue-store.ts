import { create } from "zustand";

export type IssueStatus = string;

export interface Issue {
  id: string;
  projectId: string;
  sprintId?: string | null;
  parentId?: string | null;
  title: string;
  description?: string;
  type: "epic" | "story" | "task" | "bug";
  status: IssueStatus;
  priority: string;
  labels: string[];
  dueDate?: string;
  assignee?: string;
  reporter?: string;
  estimate?: number;
  checklist?: { id: string; text: string; completed: boolean }[];
  attachments?: { id: string; name: string; url: string; size: number }[];
  comments?: { id: string; author: string; text: string; createdAt: string }[];
  activity?: { id: string; action: string; user: string; timestamp: string }[];
  createdAt: string;
  updatedAt: string;
}

interface IssueState {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
  fetchIssues: (projectId: string) => Promise<void>;
  addIssue: (projectId: string, issue: Omit<Issue, "id" | "projectId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateIssue: (projectId: string, issueId: string, data: Partial<Issue>) => Promise<void>;
  deleteIssue: (projectId: string, issueId: string) => Promise<void>;
  updateIssuesBulk: (projectId: string, newIssues: Issue[]) => Promise<void>;
}

export const useIssueStore = create<IssueState>((set) => ({
  issues: [],
  isLoading: false,
  error: null,
  
  fetchIssues: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      set({ issues: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },
  
  addIssue: async (projectId, issueData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueData),
      });
      if (!res.ok) throw new Error("Failed to create issue");
      const newIssue = await res.json();
      
      set((state) => ({
        issues: [...state.issues, newIssue],
        isLoading: false
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },

  updateIssue: async (projectId, issueId, data) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update issue");
      const updatedIssue = await res.json();
      
      set((state) => ({
        issues: state.issues.map(i => i.id === issueId ? updatedIssue : i)
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  deleteIssue: async (projectId, issueId) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${issueId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete issue");
      
      set((state) => ({
        issues: state.issues.filter(i => i.id !== issueId)
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateIssuesBulk: async (projectId, newIssues) => {
    // Optimistic UI update
    set({ issues: newIssues });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIssues),
      });
      if (!res.ok) {
        throw new Error("Failed to sync issues");
      }
    } catch (err) {
      console.error("Failed to sync issue reorder", err);
    }
  }
}));
