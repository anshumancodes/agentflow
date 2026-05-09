import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import Notification from "@/models/Notification";

/**
 * POST /api/notifications/check-due
 *
 * Finds all non-completed tasks whose dueDate is today (UTC) and creates a
 * "deadline" notification for each one that hasn't already been notified
 * today.  Safe to call multiple times — duplicates are suppressed.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Build today's date range in UTC
  const now = new Date();
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Find tasks due today that are not yet completed/discarded
  const dueTasks = await Task.find({
    createdBy: session.user.id,
    dueDate: { $gte: todayStart, $lt: todayEnd },
    status: { $nin: ["completed", "discarded"] },
  }).lean();

  if (dueTasks.length === 0) {
    return Response.json({ success: true, created: 0 });
  }

  const taskIds = dueTasks.map((t) => t._id);

  // Check which tasks already have a deadline notification created today
  const existing = await Notification.find({
    userId: session.user.id,
    taskId: { $in: taskIds },
    type: "deadline",
    createdAt: { $gte: todayStart, $lt: todayEnd },
  })
    .select("taskId")
    .lean();

  const alreadyNotified = new Set(existing.map((n) => n.taskId?.toString()));

  const toCreate = dueTasks
    .filter((t) => !alreadyNotified.has(t._id.toString()))
    .map((t) => ({
      userId: session.user.id,
      taskId: t._id,
      message: `⏰ Task due today: "${t.title}"`,
      type: "deadline" as const,
      read: false,
    }));

  if (toCreate.length > 0) {
    await Notification.insertMany(toCreate);
  }

  return Response.json({ success: true, created: toCreate.length });
}
