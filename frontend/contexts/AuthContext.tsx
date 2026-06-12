"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { api, setAuthToken } from "@/services/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthToken(data.session?.access_token);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthToken(session?.access_token);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,

      async login(email, password) {
        const { data } = await api.post("/auth/login", { email, password });
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });
        setAuthToken(data.access_token);
        router.push("/onboarding");
      },

      async signup(email, password) {
        await api.post("/auth/signup", { email, password });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setAuthToken(sessionData.session.access_token);
          router.push("/onboarding");
        } else {
          router.push("/login?confirm=true");
        }
      },

      async logout() {
        await api.post("/auth/logout").catch(() => undefined);
        await supabase.auth.signOut();
        setAuthToken(undefined);
        router.push("/login");
      },
    }),
    [loading, router, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
