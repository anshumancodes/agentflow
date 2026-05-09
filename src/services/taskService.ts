import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import type { ITask, TaskFilters } from "@/types";

/** Fetch tasks for the authenticated user with optional filters */
export async function getUserTasks(filters: TaskFilters = {}): Promise<ITask[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectDB();

  const query: Record<string, unknown> = { createdBy: session.user.id };

  if (filters.status && filters.status !== "all") {
    query.status = filters.status;
  }
  if (filters.priority && filters.priority !== "all") {
    query.priority = filters.priority;
  }
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const sortField = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;

  const tasks = await Task.find(query)
    .sort({ [sortField]: sortOrder })
    .lean();

  return tasks.map((t) => ({
    ...t,
    _id: t._id.toString(),
    createdBy: t.createdBy.toString(),
    dueDate: t.dueDate?.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })) as ITask[];
}

/** Get a single task by ID (ownership verified) */
export async function getTaskById(taskId: string): Promise<ITask | null> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectDB();
  const task = await Task.findOne({ _id: taskId, createdBy: session.user.id }).lean();
  if (!task) return null;

  return {
    ...task,
    _id: task._id.toString(),
    createdBy: task.createdBy.toString(),
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  } as ITask;
}
