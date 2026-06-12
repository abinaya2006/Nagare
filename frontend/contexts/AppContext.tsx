'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, Task, AppPage } from '@/types';

interface AppContextValue {
  page: AppPage;
  user: User | null;
  tasks: Task[];
  signupTriggeredOrb: boolean;
  navigate: (page: AppPage) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  clearSignupOrb: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Review quarterly goals',  category: 'focus',    done: false, dueToday: true  },
  { id: '2', title: 'Team standup notes',      category: 'admin',    done: true,  dueToday: true  },
  { id: '3', title: 'Write feature brief',     category: 'creative', done: false, dueToday: true  },
  { id: '4', title: 'Evening walk',            category: 'health',   done: false, dueToday: true  },
  { id: '5', title: 'Reply to Priya',          category: 'social',   done: false, dueToday: false },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<AppPage>('login');
  const [user, setUser] = useState<User | null>(null);
  const [signupTriggeredOrb, setSignupTriggeredOrb] = useState(false);

  const navigate = useCallback((p: AppPage) => setPage(p), []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 700));
    setUser({
      id: '1',
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      profileComplete: false,
    });
    setPage('dashboard');
  }, []);

  const signup = useCallback(async (name: string, email: string, _password: string) => {
    await new Promise(r => setTimeout(r, 700));
    setUser({ id: '2', name, email, profileComplete: false });
    setSignupTriggeredOrb(true);
    setPage('dashboard');
  }, []);

  const clearSignupOrb = useCallback(() => setSignupTriggeredOrb(false), []);

  return (
    <AppContext.Provider value={{
      page, user, tasks: MOCK_TASKS, signupTriggeredOrb,
      navigate, login, signup, clearSignupOrb,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
