// Task types
export type TaskPriority = "critical" | "high" | "medium" | "low";
export type TaskState = "waiting" | "flowing" | "resolved" | "overdue";
export type TaskSegment = "morning" | "afternoon" | "evening";
export type TaskCategory =
  | "Study"
  | "Projects"
  | "Creative Work"
  | "Exploration"
  | "Habits";
export type Constellation =
  | "The Scholar"
  | "The Builder"
  | "The Dreamer"
  | "The Explorer"
  | "The Guardian";

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  state: TaskState;
  category: TaskCategory;
  constellation: Constellation;
  deadline: string;
  duration: string;
  energy: "Low" | "Medium" | "High";
  notes?: string;
  segment: TaskSegment;
  createdAt: string;
}

export type TaskInput = Partial<Task> & { title: string };

// Schedule
export interface ScheduleBlock {
  id: string;
  time: string;
  label: string;
}

// NANI
export interface NaniMessage {
  id: string;
  role: "user" | "nani";
  content: string;
  timestamp: string;
}

// Dashboard
export interface MindSnapshotData {
  total: number;
  pending: number;
  completed: number;
}

// User
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
