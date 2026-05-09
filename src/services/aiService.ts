import { generateContent } from "@/lib/gemini";
import type { ITask, EmailTone } from "@/types";
import { format } from "date-fns";

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
