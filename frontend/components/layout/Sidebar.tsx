"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Sparkles,
  CalendarDays,
  Settings,
  CircleDot,
  LogOut,
} from "lucide-react";
import { useNaniSidebar } from "@/components/providers/NaniProvider";
import { useAuth } from "@/contexts/AuthContext";
import FloatingParticles from "@/components/dashboard/FloatingParticles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Flow", icon: Home },
  { href: "/world", label: "Constellation World", icon: Sparkles },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggle: toggleNani, isOpen: isNaniOpen } = useNaniSidebar();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav
      aria-label="Main navigation"
      className="glass-strong relative z-20 flex shrink-0 flex-row items-center justify-around gap-2 overflow-hidden px-3 py-2 sm:h-screen sm:w-20 sm:flex-col sm:justify-start sm:gap-6 sm:py-8 lg:w-56 lg:items-stretch lg:px-4"
    >
      <FloatingParticles count={10} className="hidden sm:block" />

      <div className="relative z-10 hidden flex-col items-center gap-1 sm:flex lg:items-start lg:px-2">
        <span className="font-display text-lg italic text-ink">Nagare</span>
        <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-soft lg:block">
          Flow
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-row items-center justify-around gap-1 sm:flex-col sm:items-stretch sm:justify-start sm:gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-ink-soft transition hover:text-ink sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 lg:px-4"
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-glow"
                  className="absolute inset-0 rounded-2xl bg-white/60 shadow-glow-lav"
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 transition ${isActive ? "text-ink" : ""}`}
                aria-hidden="true"
              />
              <span
                className={`relative z-10 text-[10px] sm:text-xs lg:text-sm ${isActive ? "text-ink" : ""}`}
              >
                {item.label === "Constellation World" ? (
                  <>
                    <span className="lg:hidden">World</span>
                    <span className="hidden lg:inline">
                      Constellation World
                    </span>
                  </>
                ) : (
                  item.label
                )}
              </span>
            </Link>
          );
        })}

        {/* NANI */}
        <button
          type="button"
          onClick={toggleNani}
          aria-pressed={isNaniOpen}
          className="group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-ink-soft transition hover:text-ink sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 lg:px-4"
        >
          {isNaniOpen && (
            <motion.span
              layoutId="sidebar-active-glow"
              className="absolute inset-0 rounded-2xl bg-white/60 shadow-glow-lav"
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
            />
          )}
          <CircleDot
            size={18}
            className={`relative z-10 transition ${isNaniOpen ? "text-ink" : ""}`}
            aria-hidden="true"
          />
          <span
            className={`relative z-10 text-[10px] sm:text-xs lg:text-sm ${isNaniOpen ? "text-ink" : ""}`}
          >
            NANI
          </span>
        </button>
      </div>

      {/* Logout — pinned to bottom on desktop, hidden on mobile bottom nav */}
      <button
        type="button"
        onClick={handleLogout}
        className="relative z-10 hidden flex-col items-center gap-1 rounded-2xl px-3 py-2 text-ink-soft transition hover:text-coral sm:flex sm:flex-row sm:justify-start sm:gap-3 sm:px-3 sm:py-2.5 lg:px-4 mt-auto"
      >
        <LogOut size={18} aria-hidden="true" />
        <span className="text-[10px] sm:text-xs lg:text-sm">Logout</span>
      </button>
    </nav>
  );
}
