import { create } from 'zustand';

export interface GlobalTask {
  id: string;
  parentId: string | null;
  name: string;
  description: string;
  progress: number;
  startDate: string;
  endDate: string;
  assignee: string;
  completed: boolean;
}

interface GlobalTaskStore {
  tasks: GlobalTask[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Partial<GlobalTask>) => Promise<void>;
  updateTask: (id: string, updates: Partial<GlobalTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useGlobalTaskStore = create<GlobalTaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  
  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const tasks = await res.json();
        set({ tasks, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addTask: async (task: Partial<GlobalTask>) => {
    // Generate a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...task, id: tempId, parentId: task.parentId || null } as GlobalTask;
    
    set((state) => ({ tasks: [...state.tasks, optimisticTask] }));

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        const newTask = await res.json();
        // Replace temp task with actual task from server
        set((state) => ({ 
          tasks: state.tasks.map(t => t.id === tempId ? newTask : t)
        }));
      } else {
        // Revert on failure
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
      }
    } catch (e) {
      console.error(e);
      // Revert on error
      set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
    }
  },

  updateTask: async (id: string, updates: Partial<GlobalTask>) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error(e);
      // Revert could be implemented here
    }
  },

  deleteTask: async (id: string) => {
    // Delete task and all its children optimistically
    const idsToDelete = new Set<string>([id]);
    
    let added = true;
    while(added) {
      added = false;
      for (const t of get().tasks) {
        if (t.parentId && idsToDelete.has(t.parentId) && !idsToDelete.has(t.id)) {
          idsToDelete.add(t.id);
          added = true;
        }
      }
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => !idsToDelete.has(t.id)),
    }));

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  }
}));
