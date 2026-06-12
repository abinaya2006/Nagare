import json
import httpx
import structlog
from app.core.config import get_settings
from app.schemas.schedules import ScheduleOutput, WorkPreferences
from app.schemas.tasks import Priority, Task, TaskStatus
from app.services.ai.base import AIProvider
from app.services.ai.prompts import schedule_prompt

log = structlog.get_logger()


class DeepSeekProvider(AIProvider):
    async def generate_schedule(self, tasks: list[Task], preferences: WorkPreferences) -> ScheduleOutput:
        settings = get_settings()
        if not settings.deepseek_api_key:
            return self._fallback(tasks)

        prompt = schedule_prompt(tasks, preferences)
        headers = {"Authorization": f"Bearer {settings.deepseek_api_key}", "Content-Type": "application/json"}
        payload = {
            "model": settings.deepseek_model,
            "messages": [
                {"role": "system", "content": "Return strict JSON only. No markdown."},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=30) as client:
            for attempt in range(3):
                try:
                    response = await client.post("https://api.deepseek.com/chat/completions", headers=headers, json=payload)
                    response.raise_for_status()
                    content = response.json()["choices"][0]["message"]["content"]
                    return ScheduleOutput.model_validate_json(content)
                except (httpx.HTTPError, KeyError, json.JSONDecodeError, ValueError) as exc:
                    log.warning("ai_schedule_invalid", attempt=attempt + 1, error=str(exc))
        return self._fallback(tasks)

    def _fallback(self, tasks: list[Task]) -> ScheduleOutput:
        from datetime import datetime, timedelta

        cursor = datetime.now().replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        items = []
        ordered = sorted(tasks, key=lambda task: (task.priority != Priority.high, task.deadline.isoformat() if task.deadline else "9999"))
        for task in ordered:
            if task.status == TaskStatus.completed:
                continue
            end = cursor + timedelta(minutes=task.estimated_duration_minutes)
            items.append({"task_id": str(task.id), "task_title": task.title, "start_time": cursor, "end_time": end})
            cursor = end + timedelta(minutes=15)
        return ScheduleOutput.model_validate({"schedule": items})
