import type { Metadata } from "next";
import { TaskCalendar } from "@/components/calendar/TaskCalendar";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
        <p className="text-muted-foreground mt-1">
          Visualize your tasks and deadlines across time.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {[
          { color: "#ef4444", label: "High priority" },
          { color: "#f59e0b", label: "Medium priority" },
          { color: "#3b82f6", label: "Low priority" },
          { color: "#10b981", label: "Completed" },
          { color: "#6b7280", label: "Discarded" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      <TaskCalendar />
    </div>
  );
}
