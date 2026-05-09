// Shared TypeScript types for the AI Task Manager

export type TaskStatus = "pending" | "in_progress" | "completed" | "discarded";
export type TaskPriority = "low" | "medium" | "high";
export type EmailTone = "professional" | "friendly" | "concise";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdBy: string;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  taskId?: string;
  message: string;
  type: "deadline" | "reminder" | "info";
  read: boolean;
  createdAt: string;
}

export interface IAiChat {
  _id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  search?: string;
  sortBy?: "dueDate" | "createdAt" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface AnalyticsData {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  discarded: number;
  completionRate: number;
  overdueCount: number;
  weeklyProgress: WeeklyProgress[];
  priorityDistribution: PriorityCount[];
}

export interface WeeklyProgress {
  day: string;
  completed: number;
  created: number;
}

export interface PriorityCount {
  priority: TaskPriority;
  count: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type ActionState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};
