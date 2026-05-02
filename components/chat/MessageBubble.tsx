import type { ChatMessage } from "@/lib/types";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-accent text-bg font-medium"
            : "bg-surface border border-border text-text/90"
        }`}
      >
        {message.content || (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.2s" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" style={{ animationDelay: "0.4s" }} />
          </span>
        )}
      </div>
    </div>
  );
}
