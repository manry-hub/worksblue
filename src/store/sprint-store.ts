import { create } from "zustand";
import { Sprint, SprintStatus, SprintSettings } from "@/types/sprint";


interface SprintState {
  sprints: Sprint[];
  isLoading: boolean;
  error: string | null;
  fetchSprints: (projectId: string) => Promise<void>;
  addSprint: (projectId: string, sprint: Omit<Sprint, "id" | "projectId" | "createdAt" | "updatedAt">) => Promise<Sprint | null>;
  updateSprint: (projectId: string, sprintId: string, data: Partial<Sprint>) => Promise<void>;
  deleteSprint: (projectId: string, sprintId: string) => Promise<void>;
  startSprint: (projectId: string, sprintId: string) => Promise<void>;
  completeSprint: (projectId: string, sprintId: string) => Promise<void>;
  cancelSprint: (projectId: string, sprintId: string) => Promise<void>;
  assignIssuesToSprint: (projectId: string, sprintId: string, issueIds: string[], action: "add" | "remove") => Promise<void>;
  getSprint: (sprintId: string) => Sprint | undefined;
  getActiveSprint: (projectId: string) => Sprint | undefined;
  getSprintsByStatus: (projectId: string, status: SprintStatus) => Sprint[];
}

export const useSprintStore = create<SprintState>((set, get) => ({
  sprints: [],
  isLoading: false,
  error: null,

  fetchSprints: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`);
      if (!res.ok) throw new Error("Failed to fetch sprints");
      const data = await res.json();
      set({ sprints: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },

  addSprint: async (projectId, sprintData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sprintData),
      });
      if (!res.ok) throw new Error("Failed to create sprint");
      const newSprint = await res.json();
      set((state) => ({ sprints: [...state.sprints, newSprint], isLoading: false }));
      return newSprint;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
      return null;
    }
  },

  updateSprint: async (projectId, sprintId, data) => {
    // Optimistic Update
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, ...data } as Sprint : s)),
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update sprint");
      const updatedSprint = await res.json();
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updatedSprint : s)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  deleteSprint: async (projectId, sprintId) => {
    // Optimistic Update
    set((state) => ({ sprints: state.sprints.filter((s) => s.id !== sprintId) }));
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete sprint");
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  startSprint: async (projectId, sprintId) => {
    // Optimistic Update
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, status: "Active" } as Sprint : s)),
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}/start`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to start sprint");
      const updatedSprint = await res.json();
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updatedSprint : s)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  completeSprint: async (projectId, sprintId) => {
    // Optimistic Update
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, status: "Completed" } as Sprint : s)),
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}/complete`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to complete sprint");
      const updatedSprint = await res.json();
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updatedSprint : s)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  cancelSprint: async (projectId, sprintId) => {
    // Optimistic Update
    set((state) => ({
      sprints: state.sprints.map((s) => (s.id === sprintId ? { ...s, status: "Cancelled" } as Sprint : s)),
    }));
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to cancel sprint");
      const updatedSprint = await res.json();
      set((state) => ({
        sprints: state.sprints.map((s) => (s.id === sprintId ? updatedSprint : s)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  assignIssuesToSprint: async (projectId, sprintId, issueIds, action) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/sprints/${sprintId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueIds, action }),
      });
      if (!res.ok) throw new Error("Failed to assign issues to sprint");
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getSprint: (sprintId) => get().sprints.find((s) => s.id === sprintId),

  getActiveSprint: (projectId) =>
    get().sprints.find((s) => s.projectId === projectId && s.status === "Active"),

  getSprintsByStatus: (projectId, status) =>
    get().sprints.filter((s) => s.projectId === projectId && s.status === status),
}));