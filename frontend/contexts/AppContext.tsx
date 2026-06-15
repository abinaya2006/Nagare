"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, Task, AppPage } from "@/types";

interface AppContextValue {
  page: AppPage;
  user: User | null;
  tasks: Task[];
  signupTriggeredOrb: boolean;

  navigate: (page: AppPage) => void;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;

  completeOnboarding: (answers: Record<string, unknown>) => void;

  clearSignupOrb: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Review quarterly goals",
    category: "Study",
    priority: "medium",
    state: "waiting",
    constellation: "The Scholar",
    deadline: new Date().toISOString(),
    duration: "30m",
    energy: "Medium",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Team standup notes",
    category: "Projects",
    priority: "medium",
    state: "resolved",
    constellation: "The Builder",
    deadline: new Date().toISOString(),
    duration: "15m",
    energy: "Low",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Write feature brief",
    category: "Creative Work",
    priority: "medium",
    state: "waiting",
    constellation: "The Dreamer",
    deadline: new Date().toISOString(),
    duration: "45m",
    energy: "High",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Evening walk",
    category: "Habits",
    priority: "low",
    state: "waiting",
    constellation: "The Guardian",
    deadline: new Date().toISOString(),
    duration: "30m",
    energy: "Low",
    segment: "evening",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Reply to Priya",
    category: "Exploration",
    priority: "low",
    state: "waiting",
    constellation: "The Explorer",
    deadline: new Date().toISOString(),
    duration: "10m",
    energy: "Low",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
];
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<AppPage>("login");

  const [user, setUser] = useState<User | null>(null);

  const [signupTriggeredOrb, setSignupTriggeredOrb] = useState(false);

  const navigate = useCallback((p: AppPage) => {
    setPage(p);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("http://localhost:8000/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    const newUser: User = {
      id: data.user_id,
      name: email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      email: data.email,
      profileComplete: false,
      onboardingComplete: false,
    };

    setUser(newUser);

    // later replace with backend flag
    setPage("onboarding");
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await fetch("http://localhost:8000/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
      }

      const newUser: User = {
        id: data.user_id,
        name,
        email,
        profileComplete: false,
        onboardingComplete: false,
      };

      setUser(newUser);

      setSignupTriggeredOrb(true);

      setPage("onboarding");
    },
    [],
  );

  const completeOnboarding = useCallback((answers: Record<string, unknown>) => {
    console.log("Onboarding Answers:", answers);

    setUser((prev) =>
      prev
        ? {
            ...prev,
            onboardingComplete: true,
            profileComplete: true,
          }
        : prev,
    );

    setPage("dashboard");
  }, []);

  const clearSignupOrb = useCallback(() => {
    setSignupTriggeredOrb(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        page,
        user,
        tasks: MOCK_TASKS,
        signupTriggeredOrb,

        navigate,

        login,
        signup,

        completeOnboarding,

        clearSignupOrb,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return ctx;
}
