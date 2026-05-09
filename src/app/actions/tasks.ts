"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { TaskSchema, TaskUpdateSchema } from "@/validators/task";
import type { ActionState } from "@/types";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function createTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string | undefined,
    status: formData.get("status") as string || "pending",
    priority: formData.get("priority") as string || "medium",
    dueDate: formData.get("dueDate") as string | undefined,
  };

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await connectDB();
  await Task.create({
    ...parsed.data,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    createdBy: session.user.id,
    aiGenerated: false,
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true, message: "Task created." };
}

export async function updateTaskAction(
  taskId: string,
  data: Record<string, unknown>
): Promise<ActionState> {
  const session = await getSession();
  const parsed = TaskUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  await connectDB();
  const task = await Task.findOneAndUpdate(
    { _id: taskId, createdBy: session.user.id },
    { ...parsed.data, dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined },
    { new: true }
  );

  if (!task) return { errors: { title: ["Task not found."] } };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true, message: "Task updated." };
}

export async function deleteTaskAction(taskId: string): Promise<ActionState> {
  const session = await getSession();
  await connectDB();
  await Task.findOneAndDelete({ _id: taskId, createdBy: session.user.id });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { success: true, message: "Task deleted." };
}
