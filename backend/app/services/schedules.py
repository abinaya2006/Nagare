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

    # --- Internal Helpers ---

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
        """
        Gathers tasks and routines, formats them, and delegates the scheduling math to the AI microservice.
        """
        tasks = self.tasks.list_tasks(user_id)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)

        # 1. Format Flexible Tasks
        tasks_json = [t.model_dump(mode="json") for t in tasks if t.status != TaskStatus.completed]

        # 2. Inject Rescheduling Events as High-Priority AI Tasks
        if event:
            duration = int((event.end_time - event.start_time).total_seconds() / 60)
            tasks_json.append({
                "id": "event-override",
                "user_id": user_id,
                "title": event.title,
                "description": "User requested fixed event override.",
                "estimated_duration_minutes": duration,
                "priority": "high",
                "status": "Pending",
                "deadline": event.end_time.isoformat(),
                "created_at": event.start_time.isoformat(),
                "updated_at": event.start_time.isoformat()
            })

        # 3. Format Routine Tasks (Fixed blocks)
        formatted_routines = [
            {
                "title": r.title,
                "start_time": r.start_time.strftime("%H:%M"),
                "end_time": r.end_time.strftime("%H:%M")
            }
            for r in routine_tasks
        ]

        # 4. Build Payload for AI Module
        ai_payload = {
            "tasks": tasks_json,
            "routine_tasks": formatted_routines,
            "preferences": preferences.model_dump(mode="json")
        }

        # 5. Call the AI Module
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    "http://127.0.0.1:8000/api/ai/generate-schedule",
                    json=ai_payload
                )
                response.raise_for_status()
                ai_data = response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Generator Error: {str(e)}")

        # 6. Return Structured Output
        return ScheduleOutput(
            schedule=ai_data.get("schedule", []),
            unscheduled_tasks=[],  # AI handles rolling over, so everything gets scheduled eventually
            justification=ai_data.get("justification", "Schedule dynamically generated by AI.")
        )