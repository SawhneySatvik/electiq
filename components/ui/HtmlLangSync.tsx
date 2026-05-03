"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/translation-runtime";

/**
 * Keeps `<html lang>` in sync with the active UI locale so screen readers
 * pronounce content correctly when the user switches languages.
 */
export function HtmlLangSync() {
  const locale = useLocale();
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
