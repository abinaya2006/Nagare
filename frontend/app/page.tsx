"use client";

import { AnimatePresence } from "framer-motion";
import { AppProvider, useApp } from "@/contexts/AppContext";
import FloatingOrbs from "@/components/FloatingOrbs";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import DashboardPage from "@/app/dashboard/page";

function AppRouter() {
  const { page, signupTriggeredOrb, clearSignupOrb } = useApp();

  return (
    <>
      {/* Persistent ambient orbs — live behind all pages */}
      <FloatingOrbs
        spawnNewOrb={signupTriggeredOrb}
        onNewOrbSettled={clearSignupOrb}
      />

      {/* Scrollable page layer */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          minHeight: "100vh",
          display: "flex",
          alignItems: page === "dashboard" ? "flex-start" : "center",
          justifyContent: "center",
          padding: page === "dashboard" ? "0" : "0",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {page === "login" && <LoginPage key="login" />}
          {page === "signup" && <SignupPage key="signup" />}
          {page === "dashboard" && <DashboardPage key="dashboard" />}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
