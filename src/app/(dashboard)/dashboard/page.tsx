import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserTasks } from "@/services/taskService";
import { getAnalytics } from "@/services/analyticsService";
import { DashboardStats } from "@/components/analytics/StatsCard";
import { RecentTasks } from "@/components/tasks/RecentTasks";
import { UpcomingDeadlines } from "@/components/tasks/UpcomingDeadlines";
import { QuickAiBar } from "@/components/ai/QuickAiBar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [tasks, analytics] = await Promise.all([
    getUserTasks({ sortBy: "createdAt", sortOrder: "desc" }),
    getAnalytics(),
  ]);

  const upcoming = tasks
    .filter((t) => t.dueDate && !["completed", "discarded"].includes(t.status))
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const recent = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Good {getGreeting()}, {session.user.name?.split(" ")[0] ?? "there"} 👋
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s on your plate today.
        </p>
      </div>

      {/* Stats cards */}
      <DashboardStats analytics={analytics} />

      {/* Quick AI bar */}
      <QuickAiBar />

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTasks tasks={recent} />
        <UpcomingDeadlines tasks={upcoming} />
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
