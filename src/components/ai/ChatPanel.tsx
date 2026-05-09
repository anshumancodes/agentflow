"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Copy, RefreshCw, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import type { ChatMessage, EmailTone } from "@/types";
import { format } from "date-fns";

const SUGGESTED_PROMPTS = [
  "What should I work on today?",
  "Summarize all overdue tasks",
  "Which high priority tasks are pending?",
  "Plan my next 3 days",
  "Generate a productivity report",
  "What tasks are due this week?",
];

const TONE_OPTIONS: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "concise", label: "Concise" },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), chatId }),
      });
      const json = await res.json();
      if (json.success) {
        const aiMsg: ChatMessage = {
          role: "assistant",
          content: json.data.response,
          timestamp: json.data.timestamp,
        };
        setMessages((m) => [...m, aiMsg]);
        if (json.data.chatId) setChatId(json.data.chatId);
      } else {
        toast.error(json.error || "AI unavailable");
        setMessages((m) => m.slice(0, -1)); // remove user msg on error
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col h-full min-h-[500px]">
      <CardHeader className="shrink-0 flex flex-row items-center gap-2 pb-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">AI Assistant</CardTitle>
          <p className="text-xs text-muted-foreground">Powered by Gemini</p>
        </div>
        {messages.length > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setMessages([]); setChatId(null); }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Ask me anything about your tasks</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  <div className={`text-[10px] mt-1 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {format(new Date(msg.timestamp), "HH:mm")}
                  </div>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(msg.content); toast.success("Copied!"); }}
                      className="mt-1 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 shrink-0">
          <Input
            id="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your tasks..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            disabled={loading}
          />
          <Button
            id="ai-chat-send"
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmailGenerator() {
  const [tone, setTone] = useState<EmailTone>("professional");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setEmail("");
    try {
      const res = await fetch("/api/ai/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone }),
      });
      const json = await res.json();
      if (json.success) {
        setEmail(json.data.email);
      } else {
        toast.error(json.error || "Failed to generate email");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Send className="w-4 h-4 text-white" />
        </div>
        <div>
          <CardTitle className="text-base">AI Email Generator</CardTitle>
          <p className="text-xs text-muted-foreground">Generate status update emails from your tasks</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 items-center">
          <Select
            id="email-tone-select"
            options={TONE_OPTIONS}
            value={tone}
            onChange={(e) => setTone(e.target.value as EmailTone)}
            className="w-40"
          />
          <Button
            id="generate-email-btn"
            onClick={generate}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {loading ? "Generating..." : "Generate Email"}
          </Button>
          {email && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { navigator.clipboard.writeText(email); toast.success("Copied to clipboard!"); }}
            >
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          )}
        </div>

        {email ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed font-mono text-foreground max-h-96 overflow-y-auto border border-border"
          >
            {email}
          </motion.div>
        ) : (
          <div className="bg-muted/50 rounded-xl p-8 text-center text-muted-foreground text-sm border border-dashed border-border">
            Select a tone and click &quot;Generate Email&quot; to create a professional email from your tasks.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
