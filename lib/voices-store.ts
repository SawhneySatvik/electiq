"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";
import { getFirebase, isFirebaseConfigured } from "./firebase";

export interface Voice {
  id: string;
  text: string;
  authorUid: string;
  authorName: string | null;
  authorPhotoURL: string | null;
  isAnonymous: boolean;
  createdAt: number;
  upvotes: number;
}

const VOICES_KEY = "electoiq-voices";
const UID_KEY = "electoiq-uid";
const VOICES_COLLECTION = "voices";
const UPVOTES_COLLECTION = "voice_upvotes";

export function isFirebaseBacked(): boolean {
  return isFirebaseConfigured();
}

// ---------- localStorage fallback ----------

function lsEnsureUid(): string {
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

function lsReadAll(): Voice[] {
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

function lsWriteAll(voices: Voice[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VOICES_KEY, JSON.stringify(voices));
  } catch {}
}

function lsListVoices(): Voice[] {
  return [...lsReadAll()].sort((a, b) => b.createdAt - a.createdAt);
}

function lsAddVoice(input: {
  text: string;
  isAnonymous: boolean;
  authorName: string | null;
  authorPhotoURL: string | null;
}): Voice {
  const all = lsReadAll();
  const v: Voice = {
    id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: input.text.trim(),
    authorUid: lsEnsureUid(),
    authorName: input.authorName,
    authorPhotoURL: input.authorPhotoURL,
    isAnonymous: input.isAnonymous,
    createdAt: Date.now(),
    upvotes: 0,
  };
  lsWriteAll([v, ...all]);
  return v;
}

function lsUpvote(id: string, uid: string): Voice | undefined {
  const all = lsReadAll();
  const upvotedKey = `electoiq-upvoted-${uid}`;
  let upvoted: Set<string>;
  try {
    upvoted = new Set<string>(JSON.parse(window.localStorage.getItem(upvotedKey) ?? "[]"));
  } catch {
    upvoted = new Set();
  }
  if (upvoted.has(id)) return all.find((v) => v.id === id);
  const next = all.map((v) => (v.id === id ? { ...v, upvotes: v.upvotes + 1 } : v));
  lsWriteAll(next);
  upvoted.add(id);
  try {
    window.localStorage.setItem(upvotedKey, JSON.stringify(Array.from(upvoted)));
  } catch {}
  return next.find((v) => v.id === id);
}

function lsHasUpvoted(id: string, uid: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(`electoiq-upvoted-${uid}`);
    if (!raw) return false;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) && arr.includes(id);
  } catch {
    return false;
  }
}

// ---------- Firestore ----------

function tsToMillis(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (typeof ts === "number") return ts;
  return Date.now();
}

export function subscribeVoices(
  onChange: (voices: Voice[]) => void,
  pageSize = 100,
): () => void {
  const fb = getFirebase();
  if (!fb) {
    onChange(lsListVoices());
    return () => {};
  }
  const q = query(
    collection(fb.db, VOICES_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(pageSize),
  );
  return onSnapshot(
    q,
    (snap) => {
      const voices: Voice[] = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          text: String(data.text ?? ""),
          authorUid: String(data.authorUid ?? ""),
          authorName: (data.authorName as string | null) ?? null,
          authorPhotoURL: (data.authorPhotoURL as string | null) ?? null,
          isAnonymous: Boolean(data.isAnonymous),
          createdAt: tsToMillis(data.createdAt),
          upvotes: Number(data.upvotes ?? 0),
        };
      });
      onChange(voices);
    },
    () => {
      // permission/network error — emit empty list rather than crash
      onChange([]);
    },
  );
}

export async function addVoice(input: {
  text: string;
  uid: string | null;
  isAnonymous: boolean;
  authorName: string | null;
  authorPhotoURL: string | null;
}): Promise<Voice | null> {
  const fb = getFirebase();
  if (!fb) {
    return lsAddVoice({
      text: input.text,
      isAnonymous: input.isAnonymous,
      authorName: input.authorName,
      authorPhotoURL: input.authorPhotoURL,
    });
  }
  if (!input.uid) return null;
  const docRef = await addDoc(collection(fb.db, VOICES_COLLECTION), {
    text: input.text.trim(),
    authorUid: input.uid,
    authorName: input.isAnonymous ? null : input.authorName,
    authorPhotoURL: input.isAnonymous ? null : input.authorPhotoURL,
    isAnonymous: input.isAnonymous,
    createdAt: serverTimestamp(),
    upvotes: 0,
  });
  return {
    id: docRef.id,
    text: input.text.trim(),
    authorUid: input.uid,
    authorName: input.isAnonymous ? null : input.authorName,
    authorPhotoURL: input.isAnonymous ? null : input.authorPhotoURL,
    isAnonymous: input.isAnonymous,
    createdAt: Date.now(),
    upvotes: 0,
  };
}

export async function deleteVoice(voiceId: string, uid: string | null): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  if (!uid) return;
  await deleteDoc(doc(fb.db, VOICES_COLLECTION, voiceId));
}

export async function upvote(voiceId: string, uid: string | null): Promise<void> {
  const fb = getFirebase();
  if (!fb) {
    if (typeof window === "undefined") return;
    lsUpvote(voiceId, uid ?? lsEnsureUid());
    return;
  }
  if (!uid) return;
  const upvoteId = `${uid}_${voiceId}`;
  const upvoteRef = doc(fb.db, UPVOTES_COLLECTION, upvoteId);
  const voiceRef = doc(fb.db, VOICES_COLLECTION, voiceId);
  await runTransaction(fb.db, async (tx) => {
    const existing = await tx.get(upvoteRef);
    if (existing.exists()) return;
    const v = await tx.get(voiceRef);
    if (!v.exists()) return;
    tx.set(upvoteRef, { uid, voiceId, createdAt: serverTimestamp() });
    tx.update(voiceRef, { upvotes: (v.data().upvotes ?? 0) + 1 });
  });
}

export async function getMyUpvotes(uid: string | null): Promise<Set<string>> {
  const fb = getFirebase();
  if (!fb) {
    if (typeof window === "undefined") return new Set();
    const effectiveUid = uid ?? lsEnsureUid();
    try {
      const raw = window.localStorage.getItem(`electoiq-upvoted-${effectiveUid}`);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }
  if (!uid) return new Set();
  // Filter to this user's upvotes so the Firestore list rule can be satisfied.
  const q = query(collection(fb.db, UPVOTES_COLLECTION), where("uid", "==", uid));
  const snap = await getDocs(q);
  const out = new Set<string>();
  snap.forEach((d) => {
    const data = d.data() as { voiceId?: string };
    if (data.voiceId) out.add(data.voiceId);
  });
  return out;
}

// Used by the localStorage fallback only (Firestore path drops legacy seed data).
export async function seedAuthorUidIfNeeded(): Promise<string> {
  return lsEnsureUid();
}

// Re-exports for backwards compat in case any caller still uses the old names.
export const listVoices = lsListVoices;
export const hasUpvoted = lsHasUpvoted;
