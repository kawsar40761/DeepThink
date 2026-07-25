"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { toast as sonnerToast } from "sonner";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { copyToClipboard as copyToClipboardUtil } from "@/lib/utils";
import { APP_CONFIG, ADMIN_EMAIL } from "@/lib/config";
import type { LiveStats } from "@/lib/types";

// ---------- useTheme ----------
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const cycleTheme = useCallback(() => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }, [theme, setTheme]);

  return { theme, resolvedTheme, setTheme, cycleTheme, mounted };
}

// ---------- useAuth ----------
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const isAdmin = useMemo(() => user?.email === ADMIN_EMAIL, [user]);

  return { user, loading, login, logout, isAdmin };
}

// ---------- useToast ----------
export function useToast() {
  return {
    success: (msg: string) => sonnerToast.success(msg),
    error: (msg: string) => sonnerToast.error(msg),
    warning: (msg: string) => sonnerToast.warning(msg),
    info: (msg: string) => sonnerToast.info(msg),
    loading: (msg: string) => sonnerToast.loading(msg),
    dismiss: (id?: string) => sonnerToast.dismiss(id),
  };
}

// ---------- useCopyToClipboard ----------
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    const success = await copyToClipboardUtil(text);
    setCopied(success);
    if (success) sonnerToast.success("Copied!");
    else sonnerToast.error("Copy failed");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return { copy, copied };
}

// ---------- useMediaQuery ----------
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// ---------- Firestore hooks ----------
export function useFirestoreDoc<T = DocumentData>(
  path: string,
  ...pathSegments: string[]
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const docRef = doc(db, path, ...pathSegments);
    const unsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) setData(snap.data() as T);
        else setData(null);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...pathSegments]);

  return { data, loading, error };
}

export function useFirestoreCollection<T = DocumentData>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const colRef = collection(db, collectionPath);
    const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string })));
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// ---------- useLiveStats ----------
export function useLiveStats() {
  return useFirestoreDoc<LiveStats>("stats", "live");
}

// ---------- useScrollPosition ----------
export function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
}

// ---------- useLocalStorage ----------
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === "undefined") return initialValue;
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T);
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

// ---------- useLoading ----------
export function useLoading(initial = false) {
  const [isLoading, setLoading] = useState(initial);
  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const withLoading = useCallback(async <T>(fn: () => Promise<T>): Promise<T> => {
    try {
      setLoading(true);
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoading, startLoading, stopLoading, withLoading };
}
