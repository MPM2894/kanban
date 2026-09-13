"use client";

import { useState, type FormEvent } from "react";
import type { BoardData } from "@/lib/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatSidebarProps = {
  board: BoardData;
  onBoardUpdate: (board: BoardData) => void;
};

export function ChatSidebar({ board, onBoardUpdate }: ChatSidebarProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || isSending) {
      return;
    }

    const priorHistory = history;
    const nextHistory: ChatMessage[] = [
      ...priorHistory,
      { role: "user", content: message },
    ];
    setInput("");
    setError(null);
    setHistory(nextHistory);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: priorHistory, board }),
      });
      if (!response.ok) {
        throw new Error(`request failed with ${response.status}`);
      }
      const data = (await response.json()) as {
        reply: string;
        board: BoardData | null;
      };
      setHistory([...nextHistory, { role: "assistant", content: data.reply }]);
      if (data.board) {
        onBoardUpdate(data.board);
      }
    } catch {
      setError("Something went wrong talking to the assistant.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <aside
      data-testid="chat-sidebar"
      className="flex h-72 w-full shrink-0 flex-col gap-3 rounded-3xl border border-white/40 bg-white/30 p-4 shadow-lg backdrop-blur-2xl md:h-auto md:w-80"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Assistant
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">
          Ask about your board
        </h2>
      </div>

      <div
        data-testid="chat-history"
        className="flex-1 space-y-2 overflow-y-auto"
      >
        {history.length === 0 && (
          <p className="text-sm text-muted">
            Try &quot;Move the review card to Done&quot; or &quot;Add a card
            about writing docs&quot;.
          </p>
        )}
        {history.map((entry, index) => (
          <div
            key={index}
            className={
              entry.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-secondary px-3 py-2 text-sm text-white"
                : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-white/70 px-3 py-2 text-sm text-navy"
            }
          >
            {entry.content}
          </div>
        ))}
        {isSending && <p className="text-sm text-muted">Thinking...</p>}
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask the assistant..."
          aria-label="Chat message"
          className="flex-1 rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none ring-accent focus:ring-2"
        />
        <button
          type="submit"
          disabled={isSending}
          className="rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-white transition hover:bg-secondary/90 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
