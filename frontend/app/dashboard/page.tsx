"use client";

import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import ProfileBanner from "@/components/ProfileBanner";
import JarPreview from "@/components/JarPreview";
import StatCard from "@/components/StatCard";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user, tasks } = useApp();

  const todayTasks = tasks.filter((t) => t.dueToday);
  const doneToday = todayTasks.filter((t) => t.done).length;
  const pendingCount = todayTasks.filter((t) => !t.done).length;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 520,
        margin: "0 auto",
        padding: "32px 16px 48px",
      }}
    >
      {/* Profile banner — shown if incomplete */}
      {user && !user.profileComplete && (
        <ProfileBanner onSetup={() => alert("Profile setup coming soon!")} />
      )}

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ marginBottom: 24 }}
      >
        <h1
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: "clamp(1.5rem, 4vw, 1.875rem)",
            fontWeight: 400,
            color: "#1C1A2E",
            letterSpacing: "-0.025em",
            marginBottom: 6,
          }}
        >
          {getGreeting()}, {firstName}.
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6B6880" }}>
          {pendingCount > 0
            ? `${pendingCount} task${pendingCount > 1 ? "s" : ""} still floating today.`
            : "Everything's done for today — well held."}
        </p>
      </motion.div>

      {/* Jar preview */}
      <JarPreview tasks={tasks} />

      {/* Quick stats */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard
          label="Focus zone"
          value="2 h 14 m"
          sub="tracked today"
          dotColor="#AFA9EC"
          delay={0}
        />
        <StatCard
          label="Done today"
          value={`${doneToday} / ${todayTasks.length}`}
          sub={
            doneToday === todayTasks.length
              ? "all clear ✦"
              : `${pendingCount} remaining`
          }
          dotColor="#5DCAA5"
          delay={0.07}
        />
        <StatCard
          label="Mood"
          value="Steady"
          sub="last logged 2 h ago"
          dotColor="#ED93B1"
          delay={0.14}
        />
      </div>
    </motion.div>
  );
}
