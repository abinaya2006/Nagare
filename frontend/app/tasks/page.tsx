import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";

export default function TasksPage() {
  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
      <section>
        <h1 className="mb-3 text-3xl font-semibold">Tasks</h1>
        <TaskForm />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Current work</h2>
        <TaskList />
      </section>
    </main>
  );
}

