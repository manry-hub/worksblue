/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { PriorityConfig, LabelConfig, SprintSettings } from "@/types/sprint";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "Planning" | "In progress" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  problemStatement?: string;
  objective?: string;
  stakeholders?: string[];
  brief?: {
    mission?: string;
    responsible?: string;
    accountable?: string;
    consulted?: string;
    informed?: string;
    budget?: string;
    timeline?: string;
    culture?: string;
    changeCapacity?: string;
    guidingPrinciples?: string;
    risksAssessment?: string;
  };
  timeline?: {
    startDate?: string;
    endDate?: string;
  };
  design?: {
    contextDiagrams?: { id: string; title: string; url?: string; excalidrawElements?: any; excalidrawAppState?: any }[];
    usecaseDiagrams?: { id: string; title: string; url?: string; excalidrawElements?: any; excalidrawAppState?: any }[];
    erds?: { id: string; title: string; url?: string; excalidrawElements?: any; excalidrawAppState?: any }[];
    uiuxDiagrams?: { id: string; title: string; url?: string; excalidrawElements?: any; excalidrawAppState?: any }[];
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
  columns: { id: string; title: string; order: number; wipLimit: number | null }[];
  priorities?: PriorityConfig[];
  labels?: LabelConfig[];
  estimateUnit?: "hour" | "day";
  issueNumberPrefix?: string;
  lastIssueCounter?: number;
  sprintSettings?: SprintSettings;
  openIssues: number;
  totalIssues?: number;
  version: string;
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  lastMutatedAt: number;
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, "id" | "progress" | "openIssues" | "totalIssues" | "createdAt" | "version" | "columns">) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  lastMutatedAt: 0,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects?_t=${Date.now()}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      if (Date.now() - get().lastMutatedAt > 15000) {
        set({ projects: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error", isLoading: false });
    }
  },
  
  addProject: async (projectData) => {
    // Optimistic Update
    const tempId = `temp-${Date.now()}`;
    const optimisticProject: Project = { 
      ...projectData, 
      id: tempId, 
      progress: 0, 
      openIssues: 0, 
      createdAt: new Date().toISOString(),
      version: "1.0",
      columns: []
    } as Project;

    set((state) => ({
      projects: [...state.projects, optimisticProject],
      lastMutatedAt: Date.now()
    }));

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const newProject = await res.json();
      
      set((state) => ({
        projects: state.projects.map(p => p.id === tempId ? newProject : p),
        lastMutatedAt: Date.now()
      }));
    } catch (err) {
      console.error(err);
      set((state) => ({ projects: state.projects.filter(p => p.id !== tempId), error: err instanceof Error ? err.message : "Unknown error" }));
    }
  },

  updateProject: async (id, projectData) => {
    // Optimistic Update
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? { ...p, ...projectData } as Project : p),
      lastMutatedAt: Date.now()
    }));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      if (!res.ok) throw new Error("Failed to update project");
      // Do not override with server response to prevent flickering from stale reads during concurrent writes
      
      set({ lastMutatedAt: Date.now() });
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  deleteProject: async (id) => {
    // Optimistic Update
    set((state) => ({
      projects: state.projects.filter(p => p.id !== id),
      lastMutatedAt: Date.now()
    }));

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
    } catch (err) {
      console.error(err);
      set({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  },

  getProject: (id) => get().projects.find((p) => p.id === id),
}));
