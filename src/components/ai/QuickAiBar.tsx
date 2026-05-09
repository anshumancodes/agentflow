"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";

const QUICK_PROMPTS = [
  "What should I work on today?",
  "Summarize overdue tasks",
  "Which high priority tasks are pending?",
];

export function QuickAiBar() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(prompt: string) {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse("");
    setMessage(prompt);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });
      const json = await res.json();
      if (json.success) {
        setResponse(json.data.response);
      } else {
        toast.error(json.error || "AI unavailable");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">Quick AI Ask</span>
          <Link href="/ai-assistant" className="ml-auto text-xs text-primary hover:underline">
            Full assistant →
          </Link>
        </div>

        <div className="flex gap-2 mb-3">
          <Input
            id="quick-ai-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask AI about your tasks..."
            className="h-9 text-sm"
            onKeyDown={(e) => e.key === "Enter" && submit(message)}
          />
          <Button
            size="sm"
            onClick={() => submit(message)}
            disabled={loading || !message.trim()}
            className="shrink-0"
            id="quick-ai-send"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => submit(p)}
              className="text-xs px-3 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Response */}
        {loading && (
          <div className="text-xs text-muted-foreground animate-pulse">
            AI is thinking...
          </div>
        )}
        {response && (
          <div className="text-sm bg-background/60 rounded-lg p-3 border border-border mt-2 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {response}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
