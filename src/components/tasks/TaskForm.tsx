"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import toast from "react-hot-toast";
import {
  Sparkles, Loader2, CheckCircle2, Circle, Trash2, PenLine, Wand2,
} from "lucide-react";
import type { ITask, TaskPriority } from "@/types";
import type { ExtractedTask } from "@/services/aiService";

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

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: "text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
  medium: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  low: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
};

// ─── Manual task form ────────────────────────────────────────────────────────

function ManualForm({
  editTask,
  onClose,
}: {
  editTask?: ITask;
  onClose: () => void;
}) {
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
  }, [editTask]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setErrors({ title: "Title is required." }); return; }

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
  );
}

// ─── AI Extract form ─────────────────────────────────────────────────────────

function AiExtractForm({ onClose }: { onClose: () => void }) {
  const createTask = useCreateTask();

  const [rawText, setRawText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedTask[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [extractError, setExtractError] = useState("");

  async function handleExtract() {
    if (rawText.trim().length < 10) {
      setExtractError("Please paste at least a sentence of text.");
      return;
    }
    setExtractError("");
    setIsExtracting(true);
    setExtracted([]);
    setSelected(new Set());

    try {
      const res = await fetch("/api/ai/extract-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Extraction failed");

      const tasks: ExtractedTask[] = json.tasks;
      setExtracted(tasks);
      // Select all by default
      setSelected(new Set(tasks.map((_, i) => i)));

      if (tasks.length === 0) {
        toast("No actionable tasks found in that text.", { icon: "🤔" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI extraction failed";
      setExtractError(msg);
      toast.error(msg);
    } finally {
      setIsExtracting(false);
    }
  }

  function toggleSelect(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  function removeTask(idx: number) {
    setExtracted((prev) => prev.filter((_, i) => i !== idx));
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i !== idx) next.add(i > idx ? i - 1 : i); });
      return next;
    });
  }

  async function handleCreateSelected() {
    const toCreate = extracted.filter((_, i) => selected.has(i));
    if (toCreate.length === 0) { toast.error("Select at least one task."); return; }

    setIsCreating(true);
    let successCount = 0;

    for (const task of toCreate) {
      await new Promise<void>((resolve) =>
        createTask.mutate(
          { ...task, aiGenerated: true } as Partial<ITask>,
          {
            onSuccess: () => { successCount++; resolve(); },
            onError: () => resolve(),
          }
        )
      );
    }

    setIsCreating(false);
    toast.success(`${successCount} task${successCount !== 1 ? "s" : ""} created!`);
    onClose();
  }

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      {/* Input area */}
      <div className="space-y-1.5">
        <Label htmlFor="ai-extract-input" className="flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-violet-500" />
          Paste your text
        </Label>
        <Textarea
          id="ai-extract-input"
          value={rawText}
          onChange={(e) => { setRawText(e.target.value); setExtractError(""); }}
          placeholder={`Paste an email, meeting notes, or any paragraph here…\n\nExample:\n"Hi team, please finalize the Q3 report by Friday, schedule a client demo next Tuesday, and make sure the staging server is updated before the release on May 20th."`}
          rows={6}
          className="resize-none text-sm font-mono"
        />
        {extractError && <p className="text-xs text-destructive">{extractError}</p>}
      </div>

      <Button
        id="ai-extract-btn"
        type="button"
        onClick={handleExtract}
        disabled={isExtracting || rawText.trim().length < 10}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
      >
        {isExtracting ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Detecting tasks…</>
        ) : (
          <><Sparkles className="w-4 h-4 mr-2" /> Extract Tasks with AI</>
        )}
      </Button>

      {/* Results */}
      <AnimatePresence>
        {extracted.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {extracted.length} task{extracted.length !== 1 ? "s" : ""} detected —{" "}
                <button
                  type="button"
                  className="text-primary hover:underline text-sm"
                  onClick={() =>
                    setSelected(
                      selected.size === extracted.length
                        ? new Set()
                        : new Set(extracted.map((_, i) => i))
                    )
                  }
                >
                  {selected.size === extracted.length ? "Deselect all" : "Select all"}
                </button>
              </p>
              <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {extracted.map((task, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative rounded-lg border p-3 cursor-pointer transition-all ${
                    selected.has(idx)
                      ? "border-primary/50 bg-primary/5"
                      : "border-border/50 bg-muted/30 opacity-60"
                  }`}
                  onClick={() => toggleSelect(idx)}
                >
                  <div className="flex items-start gap-2.5 pr-6">
                    <span className="mt-0.5 shrink-0 text-primary">
                      {selected.has(idx) ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${PRIORITY_COLOR[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            📅 {task.dueDate}
                          </Badge>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 font-medium border border-violet-200 dark:border-violet-800">
                          ✨ AI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeTask(idx); }}
                    className="absolute top-2.5 right-2.5 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                id="ai-create-tasks-btn"
                type="button"
                onClick={handleCreateSelected}
                disabled={isCreating || selectedCount === 0}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
              >
                {isCreating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Create {selectedCount} Task{selectedCount !== 1 ? "s" : ""}</>
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state — no results yet */}
      {!isExtracting && extracted.length === 0 && !extractError && (
        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground gap-2">
          <Wand2 className="w-8 h-8 opacity-30" />
          <p className="text-sm">Paste any text above and let AI detect your tasks</p>
        </div>
      )}
    </div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────

export function TaskForm({ open, onClose, editTask }: TaskFormProps) {
  const [tab, setTab] = useState<"manual" | "ai">("manual");

  // Reset tab to manual when dialog opens for editing
  useEffect(() => {
    if (editTask) setTab("manual");
  }, [editTask, open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tab === "ai" ? (
              <><Sparkles className="w-4 h-4 text-violet-500" /> AI Task Extraction</>
            ) : (
              <><PenLine className="w-4 h-4" /> {editTask ? "Edit Task" : "Create New Task"}</>
            )}
          </DialogTitle>
        </DialogHeader>

        {!editTask && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as "manual" | "ai")}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="manual" className="flex-1 gap-1.5">
                <PenLine className="w-3.5 h-3.5" /> Manual
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Extract
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ManualForm editTask={editTask} onClose={onClose} />
            </TabsContent>
            <TabsContent value="ai">
              <AiExtractForm onClose={onClose} />
            </TabsContent>
          </Tabs>
        )}

        {editTask && <ManualForm editTask={editTask} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
