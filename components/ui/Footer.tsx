"use client";

import { useT } from "@/lib/translation-runtime";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 py-8 px-6 text-xs text-muted">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <span>{useT("footer.demoNote")}</span>
        <span>{useT("footer.builtFor")}</span>
      </div>
    </footer>
  );
}
