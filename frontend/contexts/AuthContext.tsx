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
    // ✅ Restore token from localStorage on page load
    const savedToken = localStorage.getItem("nagare_token");
    if (savedToken) setAuthToken(savedToken);

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSession(data.session ?? null);
      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
        localStorage.setItem("nagare_token", data.session.access_token);
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

        if (data.access_token) {
          localStorage.setItem("nagare_token", data.access_token);
          setAuthToken(data.access_token);
          document.cookie = `nagare_token=1; path=/; SameSite=Lax`;
        }

        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        await new Promise((r) => setTimeout(r, 500)); // ✅ increased from 200ms

        // ✅ Retry preferences check up to 3 times
        let hasPreferences = false;
        for (let i = 0; i < 3; i++) {
          try {
            const { data: prefsData } = await api.get("/preferences/me");
            hasPreferences = !!prefsData?.preferences;
            break;
          } catch {
            await new Promise((r) => setTimeout(r, 300));
          }
        }

        if (hasPreferences) {
          window.location.href = "/dashboard";
        } else {
          window.location.replace("/onboarding");
        }
      },

      async signup(email, password) {
        document.cookie = "logged_out=; path=/; max-age=0; SameSite=Lax";
        const { data } = await api.post("/auth/signup", { email, password });

        if (data?.access_token && data?.refresh_token) {
          localStorage.setItem("nagare_token", data.access_token);
          setAuthToken(data.access_token);
          document.cookie = `nagare_token=1; path=/; SameSite=Lax`;
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          });
        }

        window.location.replace("/onboarding");
      },

      async logout() {
        await supabase.auth.signOut();
        setAuthToken(undefined);
        localStorage.clear();
        sessionStorage.clear();
        // ✅ Clear all auth cookies
        document.cookie = "logged_out=true; path=/; SameSite=Lax";
        document.cookie = "nagare_token=; path=/; max-age=0; SameSite=Lax";
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
