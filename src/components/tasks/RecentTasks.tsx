import { format, isToday, isTomorrow, isPast } from "date-fns";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { priorityVariant } from "@/lib/utils";
import type { ITask } from "@/types";

export function RecentTasks({ tasks }: { tasks: ITask[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Tasks</CardTitle>
        <Link
          href="/tasks"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Create one!</p>
        ) : (
          tasks.map((task) => (
            <div key={task._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDueDate(task.dueDate)}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Badge variant={priorityVariant(task.priority) as "warning" | "destructive" | "secondary"}>{task.priority}</Badge>
                <Badge variant="outline" className="capitalize">{task.status.replace("_", " ")}</Badge>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingDeadlines({ tasks }: { tasks: ITask[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
        <Link
          href="/calendar"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Calendar <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
        ) : (
          tasks.map((task) => {
            const overdue = task.dueDate && isPast(new Date(task.dueDate));
            return (
              <div
                key={task._id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${overdue ? "border-destructive/30 bg-destructive/5" : "border-transparent hover:bg-muted/50"} transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className={`text-xs mt-0.5 ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {task.dueDate ? formatDueDate(task.dueDate) : "No date"}
                    {overdue && " — OVERDUE"}
                  </p>
                </div>
                <Badge variant={priorityVariant(task.priority) as "warning" | "destructive" | "secondary"}>{task.priority}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isToday(date)) return "Due today";
  if (isTomorrow(date)) return "Due tomorrow";
  if (isPast(date)) return `Overdue — ${format(date, "MMM d")}`;
  return `Due ${format(date, "MMM d, yyyy")}`;
}
