import os
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from app.repositories.schedules import ScheduleRepository
from app.schemas.schedules import (
    ScheduleGenerateRequest,
    ScheduleOutput,
    ScheduleRecord,
    ScheduleRescheduleRequest,
    TimeBlock,
    WorkPreferences,
)
from app.schemas.tasks import TaskStatus
from app.services.preferences import PreferencesService
from app.services.tasks import TaskService
from fastapi import HTTPException


class ScheduleService:
    def __init__(self) -> None:
        self.tasks = TaskService()
        self.preferences = PreferencesService()
        self.repo = ScheduleRepository()

    async def generate(
        self, user_id: str, payload: ScheduleGenerateRequest
    ) -> ScheduleOutput:
        preferences = self._preferences_from_generate_request(payload)
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini")
        return output

    async def generate_with_preferences(
        self, user_id: str, preferences: WorkPreferences
    ) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini")
        return output

    def generate_schedule_rule_based(self, tasks: list) -> list:
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        energy_slots = {"High": "morning", "Medium": "afternoon", "Low": "evening"}

        sorted_tasks = sorted(
            tasks,
            key=lambda t: (priority_order.get(t.priority, 2), t.deadline or "9999"),
        )

        schedule = []
        for task in sorted_tasks:
            schedule.append(
                {
                    "task_id": task.id,
                    "suggested_slot": energy_slots.get(task.energy, "afternoon"),
                    "reason": f"Scheduled by priority ({task.priority}) and deadline",
                }
            )
        return schedule

    def get_current(self, user_id: str) -> ScheduleOutput:
        record = self.repo.latest(user_id)
        if not record:
            return ScheduleOutput(schedule=[], unscheduled_tasks=[])
        schedule_record = ScheduleRecord.model_validate(record)
        return ScheduleOutput(
            schedule=schedule_record.items,
            unscheduled_tasks=schedule_record.unscheduled_items,
            justification="Loaded your current schedule from the database.",
        )

    async def reschedule(
        self, user_id: str, payload: ScheduleRescheduleRequest
    ) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, WorkPreferences())
        output = await self._generate_via_ai(user_id, preferences, event=payload.event)
        self.repo.replace_current(user_id, output, source="ai_gemini_reschedule")
        return output

    async def reschedule_with_preferences(
        self, user_id: str, preferences: WorkPreferences
    ) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini_reschedule")
        return output

    def _preferences_from_generate_request(
        self, payload: ScheduleGenerateRequest
    ) -> WorkPreferences:
        return WorkPreferences(
            workday_start=payload.available_hours[0].start,
            workday_end=payload.available_hours[-1].end,
            productivity_preference=payload.productivity_preference,
        )

    def _apply_stored_preferences(
        self, user_id: str, preferences: WorkPreferences
    ) -> WorkPreferences:
        stored = self.preferences.get_user_preferences(user_id)
        if stored:
            if stored.task_count:
                preferences.max_daily_tasks = stored.task_count
            if stored.lunch_start and stored.lunch_end:
                preferences.lunch = TimeBlock(
                    start=stored.lunch_start, end=stored.lunch_end
                )
        return preferences

    def _rule_based_fallback(
        self, tasks, preferences: WorkPreferences
    ) -> ScheduleOutput:
        PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        WORKDAY_START = (
            int((preferences.workday_start or "08:00").split(":")[0])
            if isinstance(preferences.workday_start, str)
            else preferences.workday_start.hour
        )
        WORKDAY_END = (
            int((preferences.workday_end or "21:00").split(":")[0])
            if isinstance(preferences.workday_end, str)
            else preferences.workday_end.hour
        )
        BUFFER = timedelta(minutes=10)

        pending = [t for t in tasks if t.status != TaskStatus.completed]
        sorted_tasks = sorted(
            pending,
            key=lambda t: (
                PRIORITY_ORDER.get(t.priority, 2),
                str(t.deadline or "9999"),
            ),
        )

        now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
        cursor = (
            now
            if now.hour >= WORKDAY_START
            else now.replace(hour=WORKDAY_START, minute=0)
        )
        schedule = []

        for task in sorted_tasks:
            duration_mins = task.estimated_duration_minutes or 30
            remaining = duration_mins

            while remaining > 0:
                day_end = cursor.replace(hour=WORKDAY_END, minute=0, second=0)
                available = int((day_end - cursor).total_seconds() / 60)

                if available <= 0:
                    cursor = (cursor + timedelta(days=1)).replace(
                        hour=WORKDAY_START, minute=0, second=0
                    )
                    continue

                chunk = min(remaining, available)
                end = cursor + timedelta(minutes=chunk)
                schedule.append(
                    {
                        "task_id": str(task.id),
                        "task_title": task.title,
                        "start_time": cursor.isoformat(),
                        "end_time": end.isoformat(),
                    }
                )
                remaining -= chunk
                cursor = end + BUFFER

                if remaining > 0:
                    cursor = (cursor + timedelta(days=1)).replace(
                        hour=WORKDAY_START, minute=0, second=0
                    )

        return ScheduleOutput(
            schedule=schedule,
            unscheduled_tasks=[],
            justification=f"Scheduled {len(sorted_tasks)} task(s) by priority and deadline (offline mode).",
        )

    async def _generate_via_ai(
        self, user_id: str, preferences: WorkPreferences, event=None
    ) -> ScheduleOutput:
        # Fetch tasks once, outside the try, so it's available to both the
        # AI path and the fallback path without re-fetching.
        tasks = await self.tasks.list_tasks(user_id)

        try:
            routine_tasks = await self.preferences.list_routine_tasks(
                user_id, active_only=True
            )

            tasks_json = [
                t.model_dump(mode="json")
                for t in tasks
                if t.status != TaskStatus.completed
            ]

            formatted_routines = [
                {
                    "title": r.title,
                    "start_time": r.start_time.strftime("%H:%M"),
                    "end_time": r.end_time.strftime("%H:%M"),
                    "days": r.days,
                }
                for r in routine_tasks
            ]

            if event:
                formatted_routines.append(
                    {
                        "title": event.title,
                        "start_time": event.start_time.strftime("%H:%M"),
                        "end_time": event.end_time.strftime("%H:%M"),
                        "days": ["daily"],
                    }
                )

            ai_payload = {
                "tasks": tasks_json,
                "routine_tasks": formatted_routines,
                "preferences": preferences.model_dump(mode="json", by_alias=True),
            }

            async with httpx.AsyncClient(timeout=90.0) as client:
                ai_url = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000")
                response = await client.post(
                    f"{ai_url}/api/ai/generate-schedule", json=ai_payload
                )
                response.raise_for_status()
                ai_data = response.json()

            return ScheduleOutput(
                schedule=ai_data.get("schedule", []),
                unscheduled_tasks=[],
                justification=ai_data.get("justification", "Schedule generated by AI."),
            )

        except Exception as e:
            # Catches: routine_tasks fetch errors, AI service down/timeout,
            # bad AI response shape, etc. Falls back instead of crashing.
            print(f"[ScheduleService] AI failed ({e}), using rule-based fallback.")
            return self._rule_based_fallback(tasks, preferences)
