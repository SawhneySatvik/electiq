"use client";

const VOICES_KEY = "electoiq-voices";
const UID_KEY = "electoiq-uid";

export interface Voice {
  id: string;
  text: string;
  image?: string;
  authorUid: string;
  createdAt: number;
  upvotes: number;
}

function ensureUid(): string {
  if (typeof window === "undefined") return "anon";
  let uid = window.localStorage.getItem(UID_KEY);
  if (!uid) {
    uid = `u-${Math.random().toString(36).slice(2, 10)}`;
    try {
      window.localStorage.setItem(UID_KEY, uid);
    } catch {}
  }
  return uid;
}

function readAll(): Voice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VOICES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Voice[]) : [];
  } catch {
    return [];
  }
}

function writeAll(voices: Voice[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOICES_KEY, JSON.stringify(voices));
  } catch {}
}

export function getCurrentUid(): string {
  return ensureUid();
}

export function listVoices(): Voice[] {
  return [...readAll()].sort((a, b) => b.createdAt - a.createdAt);
}

export function addVoice(input: { text: string; image?: string }): Voice {
  const all = readAll();
  const voice: Voice = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: input.text.trim(),
    image: input.image,
    authorUid: ensureUid(),
    createdAt: Date.now(),
    upvotes: 0,
  };
  writeAll([voice, ...all]);
  return voice;
}

export function upvoteVoice(id: string): Voice | undefined {
  const all = readAll();
  const upvotedKey = `electoiq-upvoted-${ensureUid()}`;
  let upvoted: Set<string>;
  try {
    upvoted = new Set<string>(JSON.parse(window.localStorage.getItem(upvotedKey) ?? "[]"));
  } catch {
    upvoted = new Set();
  }
  if (upvoted.has(id)) return all.find((v) => v.id === id);
  const next = all.map((v) => (v.id === id ? { ...v, upvotes: v.upvotes + 1 } : v));
  writeAll(next);
  upvoted.add(id);
  try {
    window.localStorage.setItem(upvotedKey, JSON.stringify(Array.from(upvoted)));
  } catch {}
  return next.find((v) => v.id === id);
}

export function hasUpvoted(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(`electoiq-upvoted-${ensureUid()}`);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.includes(id);
  } catch {
    return false;
  }
}
