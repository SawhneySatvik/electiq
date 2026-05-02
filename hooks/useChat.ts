"use client";

import { useCallback } from "react";
import { useElectionStore } from "@/store/useElectionStore";
import type { ChatMessage } from "@/lib/types";

export function useChat() {
  const messages = useElectionStore((s) => s.messages);
  const chatContext = useElectionStore((s) => s.chatContext);
  const loading = useElectionStore((s) => s.chatLoading);
  const pushMessage = useElectionStore((s) => s.pushMessage);
  const appendChunk = useElectionStore((s) => s.appendToLastAssistantMessage);
  const setChatContext = useElectionStore((s) => s.setChatContext);
  const setChatLoading = useElectionStore((s) => s.setChatLoading);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: "",
        contextRecordIds: [],
      };
      pushMessage(userMsg);
      pushMessage(assistantMsg);
      setChatLoading(true);
      setChatContext([]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let contextParsed = false;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          if (!contextParsed) {
            const m = buffer.match(/^__CONTEXT__(.*?)__END_CONTEXT__/s);
            if (m) {
              try {
                const ctxRecords = JSON.parse(m[1]) as { type: string; id: string; label: string }[];
                setChatContext(
                  ctxRecords.map((r) => ({
                    type: r.type as "constituency" | "vs_constituency" | "candidate",
                    id: r.id,
                    label: r.label,
                    data: null,
                  })),
                );
              } catch {}
              buffer = buffer.slice(m[0].length);
              contextParsed = true;
            } else if (buffer.length > 4096) {
              contextParsed = true;
            }
          }

          if (contextParsed && buffer.length > 0) {
            appendChunk(buffer);
            buffer = "";
          }
        }
        if (buffer.length > 0) appendChunk(buffer);
      } catch (err) {
        const m = err instanceof Error ? err.message : "Unknown error";
        appendChunk(`\n\n[Error: ${m}]`);
      } finally {
        setChatLoading(false);
      }
    },
    [loading, pushMessage, appendChunk, setChatContext, setChatLoading],
  );

  return { messages, chatContext, loading, sendMessage };
}
