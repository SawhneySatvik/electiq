"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/translation-runtime";

export function AuthMenu() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const signInLabel = useT("auth.signIn");
  const signOutLabel = useT("auth.signOut");
  const signedInAs = useT("auth.signedInAs");
  const anonSession = useT("auth.anonSession");
  const switchAccount = useT("auth.switchAccount");

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  if (!auth.configured || !auth.ready) {
    return null;
  }

  const isSignedIn = !!auth.uid && !auth.isAnonymous;

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await auth.signInWithGoogle();
      setOpen(false);
    } catch {
      // popup blocked / cancelled — ignore silently
    } finally {
      setBusy(false);
    }
  };

  const onSignOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await auth.signOut();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!isSignedIn) {
    return (
      <button
        onClick={onSignIn}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-surface hover:border-accent/60 hover:text-accent transition-colors disabled:opacity-50"
        aria-label={signInLabel}
      >
        <GoogleGlyph />
        <span>{signInLabel}</span>
      </button>
    );
  }

  const initials = (auth.displayName ?? auth.email ?? "U")
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 px-1.5 py-1 rounded-md hover:bg-surface transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {auth.photoURL ? (
          <img
            src={auth.photoURL}
            alt=""
            className="w-7 h-7 rounded-full border border-border"
          />
        ) : (
          <span className="w-7 h-7 rounded-full border border-border bg-surface inline-flex items-center justify-center text-[10px] font-semibold">
            {initials}
          </span>
        )}
        <span className="hidden sm:inline text-xs text-text/85 max-w-[120px] truncate">
          {auth.displayName ?? auth.email ?? signedInAs}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-60 bg-surface border border-border rounded-md shadow-glow z-50 overflow-hidden"
        >
          <div className="px-3 py-2.5 border-b border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted">
              {auth.isAnonymous ? anonSession : signedInAs}
            </div>
            <div className="text-sm font-medium truncate">
              {auth.displayName ?? auth.email ?? auth.uid}
            </div>
            {auth.email && auth.displayName && (
              <div className="text-[11px] text-muted truncate">{auth.email}</div>
            )}
          </div>
          <button
            onClick={onSignIn}
            disabled={busy}
            className="w-full text-left px-3 py-2 text-xs hover:bg-surface2 transition-colors flex items-center gap-2"
          >
            <GoogleGlyph />
            {switchAccount}
          </button>
          <button
            onClick={onSignOut}
            disabled={busy}
            className="w-full text-left px-3 py-2 text-xs text-text/85 hover:bg-surface2 hover:text-accent transition-colors border-t border-border"
          >
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2a10.34 10.34 0 0 0-.16-1.84H9v3.48h4.84a4.13 4.13 0 0 1-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.86 2.69-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86A5.32 5.32 0 0 1 4 10.71H1v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M4 10.71a5.41 5.41 0 0 1 0-3.42V4.95H1a9 9 0 0 0 0 8.1l3-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.43 1.35l2.57-2.57A9 9 0 0 0 1 4.96l3 2.33A5.36 5.36 0 0 1 9 3.58z" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
