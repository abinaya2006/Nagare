import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskList } from "@/components/TaskList";

vi.mock("@/contexts/TaskContext", () => ({
  useTasks: () => ({
    loading: false,
    tasks: [{ id: "1", title: "Draft plan", description: "", priority: "High", status: "Pending", deadline: null, estimated_duration_minutes: 30 }],
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  })
}));

describe("TaskList", () => {
  it("renders tasks", () => {
    render(<TaskList />);
    expect(screen.getByText("Draft plan")).toBeInTheDocument();
  });
});

