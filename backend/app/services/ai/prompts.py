from app.schemas.schedules import WorkPreferences
from app.schemas.tasks import Task, TaskStatus


def schedule_prompt(tasks: list[Task], preferences: WorkPreferences) -> str:
    task_lines = [
        f"- id={task.id}; title={task.title}; deadline={task.deadline}; duration={task.estimated_duration_minutes}; priority={task.priority}; status={task.status}"
        for task in tasks
        if task.status != TaskStatus.completed
    ]
    return (
        "You are Pulse Plan, an intelligent scheduling assistant. "
        "Return only valid JSON matching this schema: "
        '{"schedule":[{"task_id":"string","task_title":"string","start_time":"ISO datetime","end_time":"ISO datetime"}]}. '
        "Respect deadlines, priorities, durations, and work preferences. "
        f"Work preferences: {preferences.model_dump_json()}. Tasks:\n" + "\n".join(task_lines)
    )

