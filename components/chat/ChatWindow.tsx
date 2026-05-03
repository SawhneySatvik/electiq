"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { useT } from "@/lib/translation-runtime";

export function ChatWindow() {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const placeholder = useT("chat.placeholder");
  const thinking = useT("chat.thinking");
  const sendLabel = useT("chat.send");
  const emptyTitle = useT("chat.empty.title");
  const emptyBody = useT("chat.empty.body");
  const suggestions = [
    useT("chat.suggestion.1"),
    useT("chat.suggestion.2"),
    useT("chat.suggestion.3"),
    useT("chat.suggestion.4"),
    useT("chat.suggestion.5"),
  ];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim() || loading) return;
    sendMessage(text);
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] bg-surface border border-border rounded-xl overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center mb-4">
              <span className="text-bg font-display font-bold text-xl">E</span>
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">{emptyTitle}</h2>
            <p className="text-muted max-w-md mb-8 text-sm leading-relaxed">{emptyBody}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left bg-surface2/50 hover:bg-surface2 border border-border rounded-lg px-4 py-3 text-sm text-text/90 hover:border-accent/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border p-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={loading ? thinking : placeholder}
          disabled={loading}
          className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-lg bg-accent text-bg text-sm font-semibold hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {sendLabel}
        </button>
      </form>
    </div>
  );
}
