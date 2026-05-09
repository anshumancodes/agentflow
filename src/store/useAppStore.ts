import { create } from "zustand";
import type { TaskFilters, TaskStatus, TaskPriority } from "@/types";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;

  // Task filters
  filters: TaskFilters;
  setFilters: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;

  // Active task for edit/view modal
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;

  // Task form modal
  taskFormOpen: boolean;
  setTaskFormOpen: (open: boolean) => void;
}

const defaultFilters: TaskFilters = {
  status: "all",
  priority: "all",
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  theme: "light",
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  },

  filters: defaultFilters,
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),

  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),

  activeTaskId: null,
  setActiveTaskId: (id) => set({ activeTaskId: id }),

  taskFormOpen: false,
  setTaskFormOpen: (open) => set({ taskFormOpen: open }),
}));
