import { generateContent } from "@/lib/gemini";
import type { ITask, EmailTone, TaskPriority } from "@/types";
import { format } from "date-fns";

export interface ExtractedTask {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // ISO date string YYYY-MM-DD or undefined
}

/** Build a prompt that instructs Gemini to extract structured tasks from free text */
export function buildExtractTasksPrompt(text: string): string {
  const today = format(new Date(), "yyyy-MM-dd");
  return `You are a task extraction AI. Analyze the following text (email, meeting notes, paragraph, etc.) and extract every actionable task or to-do item.

Return ONLY a valid JSON array — no prose, no markdown fences, no explanation.
Each element must have exactly these fields:
- "title": short imperative sentence (max 120 chars)
- "description": optional brief context (max 300 chars, omit if not useful)
- "priority": one of "low", "medium", "high"
- "dueDate": ISO date string YYYY-MM-DD if a specific date/deadline is mentioned, otherwise omit

Today's date is ${today}. Resolve relative dates like "tomorrow" or "next Friday" relative to today.
If no actionable tasks are found, return an empty array [].

Text to analyze:
"""
${text}
"""`;
}

/** Extract actionable tasks from arbitrary text using Gemini */
export async function extractTasksFromText(text: string): Promise<ExtractedTask[]> {
  const prompt = buildExtractTasksPrompt(text);
  const raw = await generateContent(prompt);

  // Strip any accidental markdown fences
  const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is ExtractedTask =>
        typeof t.title === "string" && ["low", "medium", "high"].includes(t.priority)
    );
  } catch {
    return [];
  }
}

/** Serialize tasks into a concise text context for the AI */
export function buildTaskContext(tasks: ITask[]): string {
  if (tasks.length === 0) return "No tasks found.";

  const now = new Date();

  return tasks
    .map((t) => {
      const due = t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "No due date";
      const isOverdue =
        t.dueDate &&
        new Date(t.dueDate) < now &&
        !["completed", "discarded"].includes(t.status);
      return `- [${t.priority.toUpperCase()}] "${t.title}" | Status: ${t.status.replace("_", " ")} | Due: ${due}${isOverdue ? " ⚠️ OVERDUE" : ""}${t.description ? ` | Notes: ${t.description.slice(0, 80)}` : ""}`;
    })
    .join("\n");
}

/** Build a chat prompt including user task context */
export function buildChatPrompt(userMessage: string, tasks: ITask[]): string {
  const taskContext = buildTaskContext(tasks);
  const now = format(new Date(), "EEEE, MMMM d, yyyy");

  return `You are TaskFlow AI, a helpful productivity assistant. Today is ${now}.

The user's current tasks:
${taskContext}

User's question: ${userMessage}

Provide a concise, actionable response. Use bullet points where helpful. Be specific about task names when referencing them.`;
}

/** Build an email generation prompt */
export function buildEmailPrompt(tasks: ITask[], tone: EmailTone): string {
  const taskContext = buildTaskContext(tasks);
  const toneGuide = {
    professional: "formal, business-appropriate language",
    friendly: "warm, approachable, collaborative tone",
    concise: "brief and to-the-point, minimal words",
  }[tone];

  return `You are a professional email writer. Generate a well-structured email update using ${toneGuide}.

Tasks to reference:
${taskContext}

Write a complete email including subject line, greeting, body paragraphs covering task status, and a professional sign-off. Format the subject line as "Subject: ...".`;
}

/** Get AI response for a user chat message */
export async function getChatResponse(
  userMessage: string,
  tasks: ITask[]
): Promise<string> {
  const prompt = buildChatPrompt(userMessage, tasks);
  return generateContent(prompt);
}

/** Generate an email draft from task context */
export async function generateEmailDraft(
  tasks: ITask[],
  tone: EmailTone
): Promise<string> {
  const prompt = buildEmailPrompt(tasks, tone);
  return generateContent(prompt);
}
