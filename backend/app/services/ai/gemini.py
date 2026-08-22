import time
import json

import httpx
import structlog

from app.core.config import get_settings
from app.schemas.schedules import ScheduleOutput, WorkPreferences
from app.schemas.tasks import Priority, Task, TaskStatus
from app.services.ai.base import AIProvider, ai_health_tracker
from app.services.ai.prompts import schedule_prompt

log = structlog.get_logger()


class GeminiProvider(AIProvider):
    provider_name = "gemini"

    def __init__(self):
        self.model_name = get_settings().gemini_model

    async def generate_schedule(self, tasks: list[Task], preferences: WorkPreferences) -> ScheduleOutput:
        start = time.perf_counter()
        settings = get_settings()

        if not settings.gemini_api_key:
            ai_health_tracker.record(success=False, latency_ms=0, error="GEMINI_API_KEY not configured", used_fallback=True)
            return self._fallback(tasks)

        prompt = schedule_prompt(tasks, preferences)
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "systemInstruction": {"parts": [{"text": "Return strict JSON only. No markdown."}]},
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"},
        }

        last_error = None
        async with httpx.AsyncClient(timeout=30) as client:
            for attempt in range(3):
                try:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    content = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                    result = ScheduleOutput.model_validate_json(content)
                    latency_ms = (time.perf_counter() - start) * 1000
                    ai_health_tracker.record(success=True, latency_ms=latency_ms, used_fallback=False)
                    return result
                except (httpx.HTTPError, KeyError, IndexError, json.JSONDecodeError, ValueError) as exc:
                    last_error = str(exc)
                    log.warning("ai_schedule_invalid", attempt=attempt + 1, error=str(exc))

        latency_ms = (time.perf_counter() - start) * 1000
        ai_health_tracker.record(success=False, latency_ms=latency_ms, error=last_error, used_fallback=True)
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
