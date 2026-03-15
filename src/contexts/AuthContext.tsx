"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "enroll-auth";

type AuthContextType = {
  isLoggedIn: boolean;
  ready: boolean;
  login: (remember: boolean) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem(STORAGE_KEY) === "true");
    setReady(true);
  }, []);

  const login = useCallback((remember: boolean) => {
    if (remember && typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: ready ? isLoggedIn : false, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
