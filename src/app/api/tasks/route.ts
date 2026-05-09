import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { TaskSchema } from "@/validators/task";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

  const query: Record<string, unknown> = { createdBy: session.user.id };
  if (status && status !== "all") query.status = status;
  if (priority && priority !== "all") query.priority = priority;
  if (search) query.$text = { $search: search };

  const tasks = await Task.find(query)
    .sort({ [sortBy]: sortOrder })
    .lean();

  return Response.json({
    success: true,
    data: tasks.map((t) => ({
      ...t,
      _id: t._id.toString(),
      createdBy: t.createdBy.toString(),
      dueDate: t.dueDate?.toISOString(),
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = TaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await connectDB();
  const task = await Task.create({
    ...parsed.data,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    createdBy: session.user.id,
    aiGenerated: body.aiGenerated || false,
  });

  return Response.json(
    {
      success: true,
      data: {
        ...task.toObject(),
        _id: task._id.toString(),
        createdBy: task.createdBy.toString(),
      },
    },
    { status: 201 }
  );
}
