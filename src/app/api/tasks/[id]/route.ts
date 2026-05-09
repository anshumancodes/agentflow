import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { TaskUpdateSchema } from "@/validators/task";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const task = await Task.findOne({ _id: id, createdBy: session.user.id }).lean();
  if (!task) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  return Response.json({
    success: true,
    data: {
      ...task,
      _id: task._id.toString(),
      createdBy: task.createdBy.toString(),
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    },
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = TaskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await connectDB();
  const task = await Task.findOneAndUpdate(
    { _id: id, createdBy: session.user.id },
    {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    },
    { new: true }
  ).lean();

  if (!task) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  return Response.json({
    success: true,
    data: {
      ...task,
      _id: task._id.toString(),
      createdBy: task.createdBy.toString(),
      dueDate: task.dueDate?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    },
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const task = await Task.findOneAndDelete({ _id: id, createdBy: session.user.id });
  if (!task) return Response.json({ success: false, error: "Not found" }, { status: 404 });

  return Response.json({ success: true, message: "Task deleted." });
}
