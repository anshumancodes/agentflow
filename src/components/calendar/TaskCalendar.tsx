"use client";

import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import type { ITask } from "@/types";

function taskColor(task: ITask) {
  if (task.status === "completed") return "#10b981";
  if (task.status === "discarded") return "#6b7280";
  switch (task.priority) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#3b82f6";
    default: return "#8b5cf6";
  }
}

export function TaskCalendar() {
  const { data: tasks, isLoading } = useTasks();

  const events = useMemo(() => {
    if (!tasks) return [];
    return tasks
      .filter((t) => t.dueDate)
      .map((t) => ({
        id: t._id,
        title: t.title,
        date: t.dueDate!.split("T")[0],
        backgroundColor: taskColor(t),
        borderColor: taskColor(t),
        textColor: "#ffffff",
        extendedProps: { status: t.status, priority: t.priority },
      }));
  }, [tasks]);

  if (isLoading) {
    return <Skeleton className="h-[600px] rounded-xl" />;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <style>{`
        .fc { font-family: inherit; }
        .fc-toolbar-title { font-size: 1rem !important; font-weight: 600 !important; }
        .fc-button { background: var(--primary) !important; border-color: var(--primary) !important; border-radius: 0.5rem !important; font-size: 0.8rem !important; }
        .fc-button:hover { opacity: 0.9 !important; }
        .fc-button-active { opacity: 0.8 !important; }
        .fc-day-today { background: hsl(var(--accent)) !important; }
        .fc-event { border-radius: 4px !important; font-size: 0.75rem !important; padding: 1px 4px !important; cursor: pointer; }
        .fc-col-header-cell { font-weight: 600; font-size: 0.8rem; }
        .fc-daygrid-day-number { font-size: 0.8rem; }
      `}</style>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
        events={events}
        height="auto"
        eventClick={(info) => {
          const task = tasks?.find((t) => t._id === info.event.id);
          if (task) {
            alert(`📌 ${task.title}\nStatus: ${task.status}\nPriority: ${task.priority}`);
          }
        }}
        nowIndicator
        editable={false}
        selectable
      />
    </div>
  );
}
