"use client";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { ContextPreview } from "@/components/chat/ContextPreview";
import { useElectionStore } from "@/store/useElectionStore";
import { useT } from "@/lib/translation-runtime";

export default function ChatPage() {
  const records = useElectionStore((s) => s.chatContext);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{useT("chat.title")}</h1>
        <p className="text-muted">{useT("chat.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ContextPreview records={records} />
        </aside>
        <ChatWindow />
      </div>
    </div>
  );
}
