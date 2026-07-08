import { create } from "zustand";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In progress" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  techStack: string[];
  repository?: string;
  deadline?: string;
  liveEnvironment?: string;
  figmaDesign?: string;
  columns: { id: string; title: string }[];
  openTasks: number;
  totalTasks?: number;
  version: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, "id" | "progress" | "openTasks" | "totalTasks" | "createdAt" | "version" | "columns">) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      set({ projects: data, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },
  
  addProject: async (projectData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      
      set((state) => ({
        projects: [...state.projects, newProject],
        isLoading: false
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updatedProject = await res.json();
      
      set((state) => ({
        projects: state.projects.map(p => p.id === id ? updatedProject : p)
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  deleteProject: async (id) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      
      set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      }));
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getProject: (id) => get().projects.find((p) => p.id === id),
}));
