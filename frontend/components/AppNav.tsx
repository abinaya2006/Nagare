"use client";

import Link from "next/link";
import { CalendarDays, ListTodo, LogOut, MessageSquareText, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Sparkles },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/orda", label: "ORDA", icon: MessageSquareText },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppNav() {
  const { user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-md bg-slate-950 text-white">P</span>
          Pulse Plan
        </Link>
        {user && (
          <nav className="flex flex-wrap items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted">
                <Icon className="size-4" aria-hidden />
                {label}
              </Link>
            ))}
            <Button className="h-9 px-3" onClick={logout} title="Log out">
              <LogOut className="size-4" />
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

