import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const notifications = await Notification.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return Response.json({
    success: true,
    data: notifications.map((n) => ({
      ...n,
      _id: n._id.toString(),
      userId: n.userId.toString(),
      taskId: n.taskId?.toString(),
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await request.json() as { ids?: string[] };
  await connectDB();

  if (ids?.length) {
    await Notification.updateMany(
      { _id: { $in: ids }, userId: session.user.id },
      { read: true }
    );
  } else {
    // Mark all as read
    await Notification.updateMany({ userId: session.user.id }, { read: true });
  }

  return Response.json({ success: true, message: "Notifications marked as read." });
}
