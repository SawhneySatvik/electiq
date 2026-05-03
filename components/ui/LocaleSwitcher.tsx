"use client";

import { useLocale, useSetLocale } from "@/lib/translation-runtime";
import { LOCALES, LOCALE_DISPLAY, type Locale } from "@/lib/i18n";

export function LocaleSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Select language"
      className="bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-text/90 hover:border-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {LOCALE_DISPLAY[l]}
        </option>
      ))}
    </select>
  );
}
