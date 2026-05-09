"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import toast from "react-hot-toast";
import type { ITask } from "@/types";

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  editTask?: ITask;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "discarded", label: "Discarded" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function TaskForm({ open, onClose, editTask }: TaskFormProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = !!editTask;

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editTask) {
      setForm({
        title: editTask.title,
        description: editTask.description || "",
        status: editTask.status,
        priority: editTask.priority,
        dueDate: editTask.dueDate ? editTask.dueDate.split("T")[0] : "",
      });
    } else {
      setForm({ title: "", description: "", status: "pending", priority: "medium", dueDate: "" });
    }
    setErrors({});
  }, [editTask, open]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrors({ title: "Title is required." });
      return;
    }

    const payload = {
      ...form,
      status: form.status as ITask["status"],
      priority: form.priority as ITask["priority"],
      dueDate: form.dueDate || undefined,
    };

    if (isEditing) {
      updateTask.mutate(
        { id: editTask._id, data: payload },
        {
          onSuccess: () => { toast.success("Task updated!"); onClose(); },
          onError: () => toast.error("Failed to update task"),
        }
      );
    } else {
      createTask.mutate(payload as Partial<ITask>, {
        onSuccess: () => { toast.success("Task created!"); onClose(); },
        onError: () => toast.error("Failed to create task"),
      });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title *</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Add details (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-priority">Priority</Label>
              <Select
                id="task-priority"
                options={PRIORITY_OPTIONS}
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due-date">Due Date</Label>
            <Input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} id="task-form-submit">
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
