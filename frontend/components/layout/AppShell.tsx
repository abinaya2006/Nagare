"use client";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import AmbientBackground from "@/components/dashboard/AmbientBackground";
import FloatingParticles from "@/components/dashboard/FloatingParticles";
import NaniSidebarMount from "@/components/layout/NaniSidebarMount";

const AUTH_PAGES = ["/", "/login", "/signup", "/onboarding"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = !pathname || AUTH_PAGES.some((p) =>
    p === "/" ? pathname === "/" : pathname.startsWith(p)
  );

  return (
    <div className={`relative flex min-h-screen flex-col sm:flex-row ${!isAuthPage ? "nagare-shell" : ""}`}>
      <AmbientBackground />
      <FloatingParticles count={16} />
      {!isAuthPage && <Sidebar />}
      <div className={`relative z-10 flex-1 ${!isAuthPage ? "nagare-main sm:ml-20 lg:ml-56 px-4 pb-28 pt-6 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8" : "px-4 pb-28 pt-6 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8"}`}>
        {children}
      </div>
      {!isAuthPage && <NaniSidebarMount />}
    </div>
  );
}
