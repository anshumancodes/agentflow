import type { Metadata } from "next";
import { ChatPanel, EmailGenerator } from "@/components/ai/ChatPanel";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AiAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Assistant</h2>
        <p className="text-muted-foreground mt-1">
          Ask questions about your tasks, get insights, and generate emails — all powered by Gemini.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
        <ChatPanel />
        <EmailGenerator />
      </div>
    </div>
  );
}
