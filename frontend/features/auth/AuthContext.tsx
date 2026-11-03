"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "@/services/auth";
import type { CurrentSession } from "@/types/auth";
import { ApiError } from "@/lib/api/client";

interface AuthContextValue {
  session: CurrentSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<CurrentSession | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<CurrentSession | null> => {
    try {
      const currentSession = await authService.getCurrentSession();
      setSession(currentSession);
      return currentSession;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setSession(null);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.signIn(email, password);
      // Construct current session from login response
      const newSession: CurrentSession = {
        user: {
          id: response.user.id,
          name: response.user.fullName,
          email: response.user.email,
        },
        organization: response.organization,
        permissions: [
          "invoices:read",
          "invoices:create",
          "invoices:approve",
          "team:manage",
        ],
      };
      setSession(newSession);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch {
      // Ignore network errors on sign out
    } finally {
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
