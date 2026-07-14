import { create } from "zustand";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In progress" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  problemStatement?: string;
  objective?: string;
  stakeholders?: string[];
  timeline?: {
    startDate?: string;
    endDate?: string;
  };
  design?: {
    contextDiagrams?: { id: string; title: string; url: string }[];
    usecaseDiagrams?: { id: string; title: string; url: string }[];
    erds?: { id: string; title: string; url: string }[];
    rbacGroups?: { id: string; name: string; }[];
    rbac?: {
       id: string;
       groupId?: string;
       permission: string;
       roles?: Record<string, boolean>;
    }[];
    apiDesignGroups?: { id: string; name: string; }[];
    apiDesign?: {
       id: string;
       groupId?: string;
       verb: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
       path: string;
       action: string;
       usedFor: string;
    }[];
    techSpecs?: {
       id: string;
       need: string;
       name: string;
       version: string;
    }[];
  };
  requirements?: {
    functionalGroups?: {
      id: string;
      name: string;
    }[];
    functional: {
      id: string;
      groupId?: string;
      requirement: string;
      description?: string;
    }[];
    nonFunctionalGroups?: {
      id: string;
      name: string;
    }[];
    nonFunctional: {
      id: string;
      groupId?: string;
      requirement: string;
      description?: string;
    }[];
    externalInterfaceGroups?: {
      id: string;
      name: string;
    }[];
    externalInterface: {
      id: string;
      groupId?: string;
      requirement: string;
      description?: string;
    }[];
  };
  implementationTasks?: Record<string, boolean>;
  testCases?: {
    id: string;
    requirementId?: string;
    testCaseId: string;
    testSteps: string;
    inputData: string;
    expectedResult: string;
    actualResult: string;
    executionStatus: 'Pending' | 'Passed' | 'Failed';
    notes: string;
  }[];
  deployment?: {
    platform?: string;
    accounts?: {
      id: string;
      platform: string;
      description: string;
      email: string;
      password?: string;
    }[];
    environments?: {
      id: string;
      name: string;
      value: string;
    }[];
    seeds?: {
      id: string;
      role: string;
      email: string;
      password?: string;
    }[];
  };
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
