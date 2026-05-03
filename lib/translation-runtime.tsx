"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  LOCALES,
  dict as staticDict,
  interpolate,
  lookupStatic,
} from "./i18n";

const LOCALE_STORAGE_KEY = "electoiq-locale";
const cacheKey = (locale: Locale) => `electoiq-tx-${locale}`;
const DEBOUNCE_MS = 80;

type TxCache = Record<string, string>;

function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

function loadCache(locale: Locale): TxCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(cacheKey(locale));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? (parsed as TxCache) : {};
  } catch {
    return {};
  }
}

function saveCache(locale: Locale, cache: TxCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(cacheKey(locale), JSON.stringify(cache));
  } catch {}
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  cache: TxCache;
  request: (text: string) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [cache, setCache] = useState<TxCache>({});
  const cacheRef = useRef<TxCache>({});
  const localeRef = useRef<Locale>("en");
  const pendingRef = useRef<Set<string>>(new Set());
  const inflightRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isLocale(stored)) {
      setLocaleState(stored);
      localeRef.current = stored;
    }
  }, []);

  useEffect(() => {
    const next = loadCache(locale);
    cacheRef.current = next;
    setCache(next);
    pendingRef.current.clear();
    inflightRef.current.clear();
    localeRef.current = locale;
  }, [locale]);

  const flush = useCallback(() => {
    const localeAtFlush = localeRef.current;
    if (localeAtFlush === "en") {
      pendingRef.current.clear();
      return;
    }
    const texts = Array.from(pendingRef.current).filter(
      (t) => !cacheRef.current[t] && !inflightRef.current.has(t),
    );
    pendingRef.current.clear();
    if (texts.length === 0) return;
    texts.forEach((t) => inflightRef.current.add(t));

    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, locale: localeAtFlush }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as { translations: string[] };
      })
      .then(({ translations }) => {
        if (localeRef.current !== localeAtFlush) return;
        const next = { ...cacheRef.current };
        texts.forEach((src, i) => {
          const out = translations[i];
          if (out) next[src] = out;
        });
        cacheRef.current = next;
        setCache(next);
        saveCache(localeAtFlush, next);
      })
      .catch(() => {
        // Silent failure — UI keeps showing English fallback.
      })
      .finally(() => {
        texts.forEach((t) => inflightRef.current.delete(t));
      });
  }, []);

  const request = useCallback(
    (text: string) => {
      if (!text || localeRef.current === "en") return;
      if (cacheRef.current[text]) return;
      if (inflightRef.current.has(text)) return;
      pendingRef.current.add(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, DEBOUNCE_MS);
    },
    [flush],
  );

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localeRef.current = l;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {}
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, cache, request }),
    [locale, setLocale, cache, request],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale/useT/useTranslated must be used within <LocaleProvider>");
  }
  return ctx;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}

export function useSetLocale(): (l: Locale) => void {
  return useLocaleContext().setLocale;
}

export function useT(key: string, vars?: Record<string, string | number>): string {
  const { locale, cache, request } = useLocaleContext();
  const { value, isFallback } = lookupStatic(locale, key);
  const interpolated = interpolate(value, vars);

  useEffect(() => {
    if (!isFallback) return;
    if (locale === "en") return;
    request(interpolate(staticDict.en[key] ?? key, vars));
  }, [isFallback, locale, key, vars, request]);

  if (!isFallback || locale === "en") return interpolated;
  return cache[interpolated] ?? interpolated;
}

export function useTranslated(rawText: string): string {
  const { locale, cache, request } = useLocaleContext();

  useEffect(() => {
    if (locale === "en" || !rawText) return;
    request(rawText);
  }, [locale, rawText, request]);

  if (locale === "en" || !rawText) return rawText;
  return cache[rawText] ?? rawText;
}
