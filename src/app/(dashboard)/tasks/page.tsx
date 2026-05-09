import type { Metadata } from "next";
import { TaskList } from "@/components/tasks/TaskList";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground mt-1">
          Create, manage, and track all your tasks in one place.
        </p>
      </div>
      <TaskList />
    </div>
  );
}
