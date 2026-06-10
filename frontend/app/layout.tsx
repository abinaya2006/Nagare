import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppNav } from "@/components/AppNav";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScheduleProvider } from "@/contexts/ScheduleContext";
import { TaskProvider } from "@/contexts/TaskContext";

export const metadata: Metadata = {
  title: "Pulse Plan",
  description: "Less Planning. More Doing.",
  manifest: "/manifest.json"
};

export const viewport: Viewport = { themeColor: "#111827" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <TaskProvider>
            <ScheduleProvider>
              <AppNav />
              {children}
            </ScheduleProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

