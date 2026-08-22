export type TaskCategory = "focus" | "admin" | "creative" | "health" | "social";
export type Priority = "high" | "medium" | "low";

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  priority: Priority;
  deadline: string; // ISO date string
  estimatedDuration: number; // minutes
  done: boolean;
  completed: boolean;
  dueToday: boolean;
}

export interface ScheduleBlock {
  id: string;
  time: string;
  label: string;
}

export interface NaniMessage {
  id: string;
  role: "user" | "nani";
  content: string;
  timestamp: string;
}

export interface MindSnapshotData {
  total: number;
  pending: number;
  completed: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileComplete: boolean;
  onboardingComplete: boolean;
}

export interface OrbConfig {
  id: number;
  color: string;
  size: number;
  initialX: number;
  initialY: number;
  duration: number;
  xRange: number;
  yRange: number;
}

export type AppPage = "login" | "signup" | "onboarding" | "dashboard";
