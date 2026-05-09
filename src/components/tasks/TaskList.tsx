"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, CheckCircle2, Circle, Loader2, Trash2, Pencil, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useAppStore } from "@/store/useAppStore";
import { priorityVariant, statusColor, cn } from "@/lib/utils";
import { format, isPast, isToday } from "date-fns";
import toast from "react-hot-toast";
import { TaskForm } from "./TaskForm";
import type { ITask, TaskStatus } from "@/types";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "discarded", label: "Discarded" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest first" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
];

export function TaskList() {
  const { filters, setFilters, taskFormOpen, setTaskFormOpen, activeTaskId, setActiveTaskId } = useAppStore();
  const { data: tasks, isLoading } = useTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [searchInput, setSearchInput] = useState(filters.search || "");

  function handleStatusToggle(task: ITask) {
    const next: TaskStatus = task.status === "completed" ? "pending" : "completed";
    updateTask.mutate(
      { id: task._id, data: { status: next } },
      { onSuccess: () => toast.success(`Task marked as ${next}`) }
    );
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    deleteTask.mutate(id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: () => toast.error("Failed to delete"),
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFilters({ search: searchInput });
  }

  const editingTask = activeTaskId ? tasks?.find((t) => t._id === activeTaskId) : undefined;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="task-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" id="task-search-btn">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <div className="flex gap-2">
          <Select
            options={PRIORITY_OPTIONS}
            value={filters.priority || "all"}
            onChange={(e) => setFilters({ priority: e.target.value as never })}
            className="h-10 w-36"
          />
          <Select
            options={SORT_OPTIONS}
            value={filters.sortBy || "createdAt"}
            onChange={(e) => setFilters({ sortBy: e.target.value as never })}
            className="h-10 w-36"
          />
          <Button id="create-task-btn" onClick={() => { setActiveTaskId(null); setTaskFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <Tabs value={filters.status || "all"} onValueChange={(v) => setFilters({ status: v as never })}>
        <TabsList className="mb-4">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {t.value !== "all" && tasks && (
                <span className="ml-1.5 text-[10px] bg-muted-foreground/20 rounded-full px-1.5">
                  {tasks.filter((task) => task.status === t.value).length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : !tasks?.length ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">No tasks found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first task to get started
                  </p>
                  <Button className="mt-4" onClick={() => setTaskFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Create Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-2">
                  {tasks.map((task, i) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <Card className="group hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Completion toggle */}
                            <button
                              onClick={() => handleStatusToggle(task)}
                              className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                              disabled={updateTask.isPending}
                            >
                              {task.status === "completed" ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : task.status === "in_progress" ? (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={cn("font-medium text-sm", task.status === "completed" && "line-through text-muted-foreground")}>
                                  {task.title}
                                </p>
                                {task.aiGenerated && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium">
                                    ✨ AI
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant={priorityVariant(task.priority) as "warning" | "destructive" | "secondary"}>
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className={cn("capitalize", statusColor(task.status))}>
                                  {task.status.replace("_", " ")}
                                </Badge>
                                {task.dueDate && (
                                  <span className={cn(
                                    "text-xs flex items-center gap-1",
                                    isPast(new Date(task.dueDate)) && task.status !== "completed"
                                      ? "text-destructive font-medium"
                                      : isToday(new Date(task.dueDate))
                                      ? "text-amber-600 dark:text-amber-400 font-medium"
                                      : "text-muted-foreground"
                                  )}>
                                    <Clock className="w-3 h-3" />
                                    {isToday(new Date(task.dueDate))
                                      ? "Due today"
                                      : isPast(new Date(task.dueDate)) && task.status !== "completed"
                                      ? `Overdue — ${format(new Date(task.dueDate), "MMM d")}`
                                      : format(new Date(task.dueDate), "MMM d, yyyy")}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                onClick={() => { setActiveTaskId(task._id); setTaskFormOpen(true); }}
                                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(task._id)}
                                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Task form modal */}
      <TaskForm
        open={taskFormOpen}
        onClose={() => { setTaskFormOpen(false); setActiveTaskId(null); }}
        editTask={editingTask}
      />
    </div>
  );
}
