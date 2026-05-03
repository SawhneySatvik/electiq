"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { getFirebase, isFirebaseConfigured } from "./firebase";

interface AuthValue {
  ready: boolean;
  configured: boolean;
  uid: string | null;
  isAnonymous: boolean;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    const fb = getFirebase();
    if (!fb) {
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(fb.auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(fb.auth);
        } catch {
          setReady(true);
        }
        return;
      }
      setUser(u);
      setReady(true);
    });
    return () => unsub();
  }, [configured]);

  const signInWithGoogle = async () => {
    const fb = getFirebase();
    if (!fb) return;
    const provider = new GoogleAuthProvider();
    await signInWithPopup(fb.auth, provider);
  };

  const signOut = async () => {
    const fb = getFirebase();
    if (!fb) return;
    await fbSignOut(fb.auth);
  };

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      configured,
      uid: user?.uid ?? null,
      isAnonymous: user?.isAnonymous ?? true,
      displayName: user?.displayName ?? null,
      photoURL: user?.photoURL ?? null,
      email: user?.email ?? null,
      signInWithGoogle,
      signOut,
    }),
    [ready, configured, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
