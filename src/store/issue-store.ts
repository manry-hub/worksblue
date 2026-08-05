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
  lastMutatedAt: number;
  fetchIssues: (projectId: string) => Promise<void>;
  addIssue: (projectId: string, issue: Omit<Issue, "id" | "projectId" | "createdAt" | "updatedAt">) => Promise<void>;
  updateIssue: (projectId: string, issueId: string, data: Partial<Issue>) => Promise<void>;
  deleteIssue: (projectId: string, issueId: string) => Promise<void>;
  updateIssuesBulk: (projectId: string, newIssues: Issue[]) => Promise<void>;
}

export const useIssueStore = create<IssueState>((set, get) => ({
  issues: [],
  isLoading: false,
  error: null,
  lastMutatedAt: 0,
  
  fetchIssues: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch issues");
      const data = await res.json();
      if (Date.now() - get().lastMutatedAt > 15000) {
        set({ issues: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
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
        isLoading: false,
        lastMutatedAt: Date.now()
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },

  updateIssue: async (projectId, issueId, data) => {
    // Optimistic Update
    set((state) => ({
      issues: state.issues.map(i => i.id === issueId ? { ...i, ...data } as Issue : i),
      lastMutatedAt: Date.now()
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update issue");
      
      set({ lastMutatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  deleteIssue: async (projectId, issueId) => {
    // Optimistic Update
    set((state) => ({
      issues: state.issues.filter(i => i.id !== issueId),
      lastMutatedAt: Date.now()
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks/${issueId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete issue");
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  updateIssuesBulk: async (projectId, newIssues) => {
    // Optimistic UI update
    set({ issues: newIssues, lastMutatedAt: Date.now() });
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIssues),
      });
      if (!res.ok) {
        throw new Error("Failed to sync issues");
      }
      set({ lastMutatedAt: Date.now() });
    } catch (err) {
      console.error("Failed to sync issue reorder", err);
    }
  }
}));
