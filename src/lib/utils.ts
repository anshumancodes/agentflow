import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Map task priority to badge variant */
export function priorityVariant(priority: string): string {
  switch (priority) {
    case "high": return "destructive";
    case "medium": return "warning";
    case "low": return "secondary";
    default: return "secondary";
  }
}

/** Map task status to a color class */
export function statusColor(status: string): string {
  switch (status) {
    case "completed": return "text-emerald-600 dark:text-emerald-400";
    case "in_progress": return "text-blue-600 dark:text-blue-400";
    case "pending": return "text-amber-600 dark:text-amber-400";
    case "discarded": return "text-muted-foreground line-through";
    default: return "";
  }
}
