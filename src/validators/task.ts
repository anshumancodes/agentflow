import { z } from "zod";

export const TaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required." })
    .max(200, { message: "Title must be under 200 characters." })
    .trim(),
  description: z.string().max(2000).optional(),
  status: z.enum(["pending", "in_progress", "completed", "discarded"]).default("pending"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  dueDate: z.string().optional().nullable(),
});

export const TaskUpdateSchema = TaskSchema.partial();

export type TaskInput = z.infer<typeof TaskSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;
