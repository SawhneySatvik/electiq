"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/translation-runtime";
import { useAuth } from "@/lib/auth";
import {
  addVoice,
  getMyUpvotes,
  isFirebaseBacked,
  subscribeVoices,
  upvote,
  type Voice,
} from "@/lib/voices-store";

export default function VoicesPage() {
  const auth = useAuth();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [text, setText] = useState("");
  const [postAnon, setPostAnon] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [myUpvotes, setMyUpvotes] = useState<Set<string>>(new Set());

  const title = useT("voices.title");
  const subtitle = useT("voices.subtitle");
  const placeholder = useT("voices.composer.placeholder");
  const submit = useT("voices.composer.submit");
  const empty = useT("voices.empty");
  const upvoteLabel = useT("voices.upvote");
  const upvotedLabel = useT("voices.upvoted");
  const anonToggleLabel = useT("voices.postAnon");
  const anonBadge = useT("voices.anonymous");
  const fbConnected = useT("voices.banner.firebaseConnected");
  const fbMissing = useT("voices.banner.firebaseMissing");
  const signInPrompt = useT("voices.signInPrompt");

  const backed = isFirebaseBacked();

  useEffect(() => {
    const unsub = subscribeVoices(setVoices);
    return () => unsub();
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyUpvotes(auth.uid).then((set) => {
      if (!cancelled) setMyUpvotes(set);
    });
    return () => {
      cancelled = true;
    };
  }, [auth.uid, voices.length]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await addVoice({
        text,
        uid: auth.uid,
        isAnonymous: !auth.uid || auth.isAnonymous || postAnon,
        authorName: auth.displayName,
        authorPhotoURL: auth.photoURL,
      });
      if (!result) {
        setError("Could not post — please retry.");
      } else {
        setText("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  const onUpvote = async (id: string) => {
    if (myUpvotes.has(id)) return;
    setMyUpvotes(new Set([...myUpvotes, id]));
    try {
      await upvote(id, auth.uid);
    } catch {
      setMyUpvotes(new Set([...myUpvotes].filter((x) => x !== id)));
    }
  };

  const isSignedIn = backed && auth.uid && !auth.isAnonymous;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-muted">{subtitle}</p>
      </div>

      <div
        className={`rounded-xl border px-3 py-2 text-xs mb-6 ${
          backed
            ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/5 text-amber-300"
        }`}
      >
        {backed ? fbConnected : fbMissing}
      </div>

      {backed && !isSignedIn && (
        <div className="rounded-xl border border-border bg-bg/40 px-3 py-2 text-xs text-muted mb-6">
          {signInPrompt}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-surface border border-border rounded-xl p-5 mb-8 space-y-3"
      >
        <label htmlFor="voices-composer" className="sr-only">
          {placeholder}
        </label>
        <textarea
          id="voices-composer"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          rows={3}
          maxLength={1200}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isSignedIn ? (
            <label className="text-xs text-muted inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={postAnon}
                onChange={(e) => setPostAnon(e.target.checked)}
                className="accent-accent"
              />
              {anonToggleLabel}
            </label>
          ) : (
            <span className="text-xs text-muted">·</span>
          )}
          <button
            type="submit"
            disabled={!text.trim() || submitting}
            className="px-5 py-2 rounded-lg bg-accent text-bg text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            {submit}
          </button>
        </div>
        {error && <div className="text-xs text-red-400">{error}</div>}
      </form>

      {voices.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center text-muted">
          {empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {voices.map((v) => {
            const upvoted = myUpvotes.has(v.id);
            const showName = !v.isAnonymous && v.authorName;
            return (
              <li key={v.id} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {showName && v.authorPhotoURL && (
                    <img
                      src={v.authorPhotoURL}
                      alt=""
                      className="w-6 h-6 rounded-full border border-border"
                    />
                  )}
                  <span className="text-xs font-medium">
                    {showName ? v.authorName : anonBadge}
                  </span>
                  <span className="text-[10px] text-muted">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-text/90 leading-relaxed whitespace-pre-wrap mb-2">
                  {v.text}
                </div>
                <div className="flex items-center justify-end text-xs">
                  <button
                    onClick={() => onUpvote(v.id)}
                    disabled={upvoted}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      upvoted
                        ? "border-accent/40 text-accent/70 cursor-default"
                        : "border-border hover:border-accent/60 hover:text-accent"
                    }`}
                  >
                    ▲ {upvoted ? upvotedLabel : upvoteLabel} · {v.upvotes}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
