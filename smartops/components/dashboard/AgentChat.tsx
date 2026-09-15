"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Department } from "@/types";

type ChatEndpoint = "assistant" | "integrations" | Department;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AgentChat({
  endpoint = "assistant",
  title = "Ask SmartOps",
  placeholder = "Ask about clients, approvals, agents…",
}: {
  endpoint?: ChatEndpoint;
  title?: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`/api/agents/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history: messages }),
      });
      const data = await res.json();
      setMessages([
        ...nextMessages,
        { role: "assistant", content: res.ok ? data.reply : data.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "Network error — please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">No messages yet — ask a question to get started.</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-lg px-3 py-2 text-sm",
              m.role === "user"
                ? "ml-auto bg-brand-600 text-white"
                : "bg-slate-100 text-slate-700"
            )}
          >
            {m.content}
          </div>
        ))}
        {loading && <div className="max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-400">Thinking…</div>}
      </div>

      <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
