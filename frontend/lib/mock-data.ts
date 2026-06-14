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
    estimatedDuration: 90,
    completed: false,
  },
  {
    id: "t2",
    title: "Reply to Mira",
    deadline: atTime(13, 30),
    priority: "medium",
    estimatedDuration: 15,
    completed: false,
  },
  {
    id: "t3",
    title: "Water the plants",
    deadline: atTime(19, 0),
    priority: "low",
    estimatedDuration: 5,
    completed: false,
  },
  {
    id: "t4",
    title: "Review design tokens",
    deadline: atTime(11, 0, 1),
    priority: "medium",
    estimatedDuration: 45,
    completed: false,
  },
  {
    id: "t5",
    title: "Plan weekend trip",
    deadline: atTime(20, 0, 2),
    priority: "low",
    estimatedDuration: 30,
    completed: false,
  },
  {
    id: "t6",
    title: "Submit tax forms",
    deadline: atTime(9, 0, 4),
    priority: "high",
    estimatedDuration: 60,
    completed: false,
  },
  {
    id: "t7",
    title: "Morning journal",
    deadline: atTime(8, 0),
    priority: "low",
    estimatedDuration: 10,
    completed: true,
  },
  {
    id: "t8",
    title: "Stretch session",
    deadline: atTime(7, 30),
    priority: "low",
    estimatedDuration: 15,
    completed: true,
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
