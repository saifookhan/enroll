"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "enroll-auth";

export type AuthUser = {
  userId: string;
  token: string | null;
} | null;

type AuthContextType = {
  isLoggedIn: boolean;
  ready: boolean;
  user: AuthUser;
  login: (remember: boolean, userId?: string, token?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function loadStored(): { isLoggedIn: boolean; user: AuthUser } {
  if (typeof window === "undefined") return { isLoggedIn: false, user: null };
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { isLoggedIn: false, user: null };
  if (raw === "true") return { isLoggedIn: true, user: null };
  try {
    const parsed = JSON.parse(raw) as { userId?: string; token?: string | null };
    if (parsed?.userId) {
      return { isLoggedIn: true, user: { userId: parsed.userId, token: parsed.token ?? null } };
    }
  } catch {
    /* ignore */
  }
  return { isLoggedIn: raw === "true", user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { isLoggedIn: stored, user: storedUser } = loadStored();
    setIsLoggedIn(stored);
    setUser(storedUser);
    setReady(true);
  }, []);

  const login = useCallback((remember: boolean, userId?: string, token?: string | null) => {
    const u = userId ? { userId, token: token ?? null } : null;
    setUser(u);
    setIsLoggedIn(true);
    if (remember && typeof window !== "undefined") {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: u.userId, token: u.token }));
      } else {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: ready ? isLoggedIn : false, ready, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
