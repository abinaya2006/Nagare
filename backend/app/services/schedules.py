import uuid
import httpx
from fastapi import HTTPException
from app.repositories.schedules import ScheduleRepository
from app.schemas.schedules import (
    ScheduleGenerateRequest,
    ScheduleOutput,
    ScheduleRecord,
    ScheduleRescheduleRequest,
    WorkPreferences,
)
from app.schemas.tasks import TaskStatus
from app.services.tasks import TaskService
from app.services.preferences import PreferencesService

class ScheduleService:
    def __init__(self) -> None:
        self.tasks = TaskService()
        self.preferences = PreferencesService()
        self.repo = ScheduleRepository()

    async def generate(self, user_id: str, payload: ScheduleGenerateRequest) -> ScheduleOutput:
        preferences = self._preferences_from_generate_request(payload)
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini")
        return output

    async def generate_with_preferences(self, user_id: str, preferences: WorkPreferences) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini")
        return output

    def get_current(self, user_id: str) -> ScheduleOutput:
        record = self.repo.latest(user_id)
        if not record:
            return ScheduleOutput(schedule=[], unscheduled_tasks=[])
        schedule_record = ScheduleRecord.model_validate(record)
        return ScheduleOutput(
            schedule=schedule_record.items,
            unscheduled_tasks=schedule_record.unscheduled_items,
            justification="Loaded your current schedule from the database."
        )

    async def reschedule(self, user_id: str, payload: ScheduleRescheduleRequest) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, WorkPreferences())
        output = await self._generate_via_ai(user_id, preferences, event=payload.event)
        self.repo.replace_current(user_id, output, source="ai_gemini_reschedule")
        return output

    async def reschedule_with_preferences(self, user_id: str, preferences: WorkPreferences) -> ScheduleOutput:
        preferences = self._apply_stored_preferences(user_id, preferences)
        output = await self._generate_via_ai(user_id, preferences)
        self.repo.replace_current(user_id, output, source="ai_gemini_reschedule")
        return output

    def _preferences_from_generate_request(self, payload: ScheduleGenerateRequest) -> WorkPreferences:
        return WorkPreferences(
            workday_start=payload.available_hours[0].start,
            workday_end=payload.available_hours[-1].end,
            productivity_preference=payload.productivity_preference,
        )

    def _apply_stored_preferences(self, user_id: str, preferences: WorkPreferences) -> WorkPreferences:
        stored = self.preferences.get_user_preferences(user_id)
        if stored and stored.task_count:
            preferences.max_daily_tasks = stored.task_count
        return preferences

    async def _generate_via_ai(self, user_id: str, preferences: WorkPreferences, event=None) -> ScheduleOutput:
        tasks = self.tasks.list_tasks(user_id)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)

        tasks_json = [t.model_dump(mode="json") for t in tasks if t.status != TaskStatus.completed]

        # The backend dev added "days" to routines. Pass them to the AI!
        formatted_routines = [
            {
                "title": r.title,
                "start_time": r.start_time.strftime("%H:%M"),
                "end_time": r.end_time.strftime("%H:%M"),
                "days": r.days  # <-- Backend's new feature
            }
            for r in routine_tasks
        ]

        if event:
            formatted_routines.append({
                "title": event.title,
                "start_time": event.start_time.strftime("%H:%M"),
                "end_time": event.end_time.strftime("%H:%M"),
                "days": ["daily"] # Force one-off events to schedule today
            })

        ai_payload = {
            "tasks": tasks_json,
            "routine_tasks": formatted_routines,
            "preferences": preferences.model_dump(mode="json", by_alias=True)
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8000/api/ai/generate-schedule",
                    json=ai_payload
                )
                response.raise_for_status()
                ai_data = response.json()
        except httpx.HTTPStatusError as e:
            error_detail = e.response.text 
            print(f"CRITICAL AI ERROR: {error_detail}")
            raise HTTPException(status_code=500, detail=f"AI 422 Error: {error_detail}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Generator Error: {str(e)}")
        
        return ScheduleOutput(
            schedule=ai_data.get("schedule", []),
            unscheduled_tasks=[],
            justification=ai_data.get("justification", "Schedule dynamically generated by AI.")
        )
