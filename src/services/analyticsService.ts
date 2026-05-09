import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import type { AnalyticsData, WeeklyProgress } from "@/types";
import { subDays, startOfDay, format } from "date-fns";

export async function getAnalytics(): Promise<AnalyticsData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  await connectDB();

  const [stats, weekly, priorityDist] = await Promise.all([
    // Status distribution
    Task.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Last 7 days activity
    Task.aggregate([
      {
        $match: {
          createdBy: userId,
          createdAt: { $gte: subDays(new Date(), 7) },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]),

    // Priority distribution
    Task.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
  ]);

  // Compute status counts
  const statusMap: Record<string, number> = {};
  for (const s of stats) {
    statusMap[s._id] = s.count;
  }
  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const completed = statusMap["completed"] || 0;
  const pending = statusMap["pending"] || 0;
  const inProgress = statusMap["in_progress"] || 0;
  const discarded = statusMap["discarded"] || 0;

  // Overdue tasks (past due date, not completed/discarded)
  const overdueCount = await Task.countDocuments({
    createdBy: userId,
    dueDate: { $lt: new Date() },
    status: { $nin: ["completed", "discarded"] },
  });

  // Build weekly progress
  const last7Days: WeeklyProgress[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const dayStr = format(date, "yyyy-MM-dd");
    const dayLabel = format(date, "EEE");

    const dayEntries = weekly.filter((w) => w._id.day === dayStr);
    const completedDay = dayEntries.find((e) => e._id.status === "completed")?.count || 0;
    const createdDay = dayEntries.reduce((a: number, e: { count: number }) => a + e.count, 0);

    last7Days.push({ day: dayLabel, completed: completedDay, created: createdDay });
  }

  return {
    total,
    completed,
    pending,
    inProgress,
    discarded,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    overdueCount,
    weeklyProgress: last7Days,
    priorityDistribution: priorityDist.map((p) => ({
      priority: p._id,
      count: p.count,
    })),
  };
}
