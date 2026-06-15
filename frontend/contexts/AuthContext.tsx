"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api, setAuthToken } from "@/services/api";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session ?? null);
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
      }
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session ?? null);
      if (session?.access_token) {
        setAuthToken(session.access_token);
      } else {
        setAuthToken(undefined);
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,

      async login(email, password) {
        document.cookie = "logged_out=; path=/; max-age=0; SameSite=Lax";

        const { data } = await api.post("/auth/login", { email, password });
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        setAuthToken(data.access_token);
        await new Promise((r) => setTimeout(r, 200));

        try {
          const { data: prefsData } = await api.get("/preferences/me");
          const hasPreferences = !!prefsData?.preferences;
          // ✅ hard navigate so browser sends fresh cookies to middleware
          window.location.href = hasPreferences ? "/dashboard" : "/onboarding";
        } catch {
          window.location.href = "/onboarding";
        }
      },

      async signup(email, password) {
        document.cookie = "logged_out=; path=/; max-age=0; SameSite=Lax";
        await api.post("/auth/signup", { email, password });
        // Tell middleware to allow /login even if token exists
        document.cookie = "signup_redirect=true; path=/; SameSite=Lax";
        router.push("/login?confirm=true");
      },

      async logout() {
        // ✅ Skip backend call — token may be undefined, cookie is httponly so backend can't clear it properly anyway
        await supabase.auth.signOut();
        setAuthToken(undefined);
        localStorage.clear();
        sessionStorage.clear();

        // ✅ Set logout flag — middleware checks this to block access even if pulse_access_token cookie lingers
        document.cookie = "logged_out=true; path=/; SameSite=Lax";

        window.location.href = "/login";
      },
    }),
    [loading, router, user, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
