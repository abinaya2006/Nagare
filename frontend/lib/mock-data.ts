import type { Task, ScheduleBlock, MindSnapshotData } from "@/types";

const today = new Date();
function atTime(hour: number, minute = 0, dayOffset = 0) {
  const d = new Date(today);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Finish onboarding flow",
    deadline: atTime(17, 0),
    priority: "high",
    state: "waiting",
    category: "Projects",
    constellation: "The Builder",
    duration: "90m",
    energy: "High",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "Reply to Mira",
    deadline: atTime(13, 30),
    priority: "medium",
    state: "waiting",
    category: "Exploration",
    constellation: "The Explorer",
    duration: "15m",
    energy: "Low",
    segment: "afternoon",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t3",
    title: "Water the plants",
    deadline: atTime(19, 0),
    priority: "low",
    state: "waiting",
    category: "Habits",
    constellation: "The Guardian",
    duration: "5m",
    energy: "Low",
    segment: "evening",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t4",
    title: "Review design tokens",
    deadline: atTime(11, 0, 1),
    priority: "medium",
    state: "waiting",
    category: "Projects",
    constellation: "The Builder",
    duration: "45m",
    energy: "Medium",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t5",
    title: "Plan weekend trip",
    deadline: atTime(20, 0, 2),
    priority: "low",
    state: "waiting",
    category: "Exploration",
    constellation: "The Explorer",
    duration: "30m",
    energy: "Low",
    segment: "evening",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t6",
    title: "Submit tax forms",
    deadline: atTime(9, 0, 4),
    priority: "high",
    state: "waiting",
    category: "Study",
    constellation: "The Scholar",
    duration: "60m",
    energy: "High",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t7",
    title: "Morning journal",
    deadline: atTime(8, 0),
    priority: "low",
    state: "resolved",
    category: "Habits",
    constellation: "The Guardian",
    duration: "10m",
    energy: "Low",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t8",
    title: "Stretch session",
    deadline: atTime(7, 30),
    priority: "low",
    state: "resolved",
    category: "Habits",
    constellation: "The Guardian",
    duration: "15m",
    energy: "Low",
    segment: "morning",
    createdAt: new Date().toISOString(),
  },
];

export const mockSchedule: ScheduleBlock[] = [
  { id: "s1", time: "9:00", label: "Deep Work" },
  { id: "s2", time: "11:00", label: "Break" },
  { id: "s3", time: "11:30", label: "Coding" },
  { id: "s4", time: "14:00", label: "Lunch" },
  { id: "s5", time: "15:00", label: "Project Work" },
];

export const mockSnapshot: MindSnapshotData = {
  total: 18,
  pending: 7,
  completed: 11,
};
