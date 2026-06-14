import PWARegister from "@/components/PWARegister";
import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { NaniProvider } from "@/components/providers/NaniProvider";
import { TaskProvider } from "@/contexts/TaskContext";  // ← add
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Nagare",
  description: "A calm productivity app that drifts with you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E8E1FF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nagare" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AppProvider>
            <NaniProvider>
              <TaskProvider>      {/* ← wrap here, inside AuthProvider so user is available */}
                <AppShell>{children}</AppShell>
              </TaskProvider>
            </NaniProvider>
          </AppProvider>
        </AuthProvider>
        <PWARegister />
      </body>
    </html>
  );
}
