"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sparkles, CalendarDays, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import FloatingParticles from "@/components/dashboard/FloatingParticles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Flow", icon: Home },
  { href: "/world", label: "World", iconLabel: "Constellation World", icon: Sparkles },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function ThemeToggle({ compact }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.93 }}
      className={`relative z-10 flex items-center gap-3 rounded-2xl px-3 py-2 transition sm:py-2.5 lg:px-4 ${
        isDark
          ? "text-ink-soft hover:text-ink hover:bg-white/10"
          : "text-ink-soft hover:text-ink hover:bg-white/20"
      }`}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -20, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.22 }}
        className="flex h-[18px] w-[18px] items-center justify-center text-base leading-none"
        aria-hidden="true"
      >
        {isDark ? "☽" : "○"}
      </motion.span>
      {!compact && (
        <span className="hidden text-xs sm:block lg:text-sm">
          {isDark ? "Light mode" : "Dark mode"}
        </span>
      )}
    </motion.button>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <>
      {/* ── Mobile bottom bar ── */}
      <nav
        aria-label="Main navigation"
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around gap-1 border-t border-white/20 bg-white/60 backdrop-blur-md dark:bg-[rgba(10,8,35,0.75)] dark:border-white/8 px-2 py-2 sm:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 transition ${
                isActive ? "text-ink bg-white/60 dark:bg-white/10 shadow-glow-lav" : "text-ink-soft"
              }`}
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Theme toggle — mobile */}
        <button
          type="button"
          onClick={() => {}}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-ink-soft transition"
        >
          <ThemeToggle compact />
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-ink-soft transition hover:text-coral"
        >
          <LogOut size={20} aria-hidden="true" />
          <span className="text-[10px]">Logout</span>
        </button>
      </nav>

      {/* ── Desktop sidebar ── */}
      <nav
        aria-label="Main navigation"
        className="glass-strong fixed left-0 top-0 z-20 hidden shrink-0 flex-col items-center gap-6 overflow-hidden px-3 py-8 sm:flex sm:h-screen sm:w-20 lg:w-56 lg:items-stretch lg:px-4"
      >
        <FloatingParticles count={10} />

        {/* Brand */}
        <div className="relative z-10 flex flex-col items-center gap-1 lg:items-start lg:px-2">
          <span className="font-display text-lg italic text-ink">Nagare</span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-ink-soft lg:block">
            Flow
          </span>
        </div>

        {/* Nav links */}
        <div className="relative z-10 flex flex-1 flex-col items-stretch gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition sm:flex-row sm:justify-start sm:gap-3 sm:py-2.5 lg:px-4 ${
                  isActive
                    ? "bg-white/60 dark:bg-white/10 shadow-glow-lav text-ink"
                    : "text-ink-soft hover:text-ink hover:bg-white/20 dark:hover:bg-white/8"
                }`}
              >
                <Icon size={18} className="relative z-10" aria-hidden="true" />
                <span className="relative z-10 hidden text-xs sm:block lg:text-sm">
                  {"iconLabel" in item ? (
                    <>
                      <span className="lg:hidden">{item.label}</span>
                      <span className="hidden lg:inline">{item.iconLabel}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom section — theme toggle + logout */}
        <div className="relative z-10 mt-auto flex flex-col gap-1">
          <ThemeToggle />

          <motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-ink-soft transition hover:text-coral hover:bg-white/20 dark:hover:bg-white/8 sm:flex-row sm:justify-start sm:gap-3 sm:py-2.5 lg:px-4"
          >
            <LogOut size={18} aria-hidden="true" />
            <span className="hidden text-xs sm:block lg:text-sm">Logout</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
