import httpx
from app.schemas.orda import OrdaHistoryResponse, ORDARequest, OrdaResponse
from app.schemas.schedules import WorkPreferences  # <-- Added this import
from app.services.preferences import PreferencesService
from app.services.schedules import ScheduleService
from fastapi import HTTPException


class OrdaService:
    def __init__(self):
        self.schedule_service = ScheduleService()
        self.preferences_service = PreferencesService()

    async def process(self, user_id: str, payload: ORDARequest) -> OrdaResponse:
        # 1. Fetch the user's DB preferences to send to the AI for chat context
        user_prefs = self.preferences_service.get_user_preferences(user_id)
        prefs_data = user_prefs.model_dump(mode="json") if user_prefs else {}

        # 2. Build the payload for your AI Module
        ai_payload = {"message": payload.message, "preferences": prefs_data}

        # 3. Call the AI Module
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                ai_response = await client.post(
                    "http://127.0.0.1:8000/api/ai/orda/chat", json=ai_payload
                )
                ai_response.raise_for_status()
                ai_data = ai_response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI ORDA Error: {str(e)}")

        # 4. Parse AI response
        intent = ai_data.get("intent", "info")
        ai_summary = ai_data.get("summary", "Processed your request.")

        action_taken = False
        response_data = {}

        # 5. Execute Backend Logic Based on Intent
        if intent in ["generate_schedule", "reschedule"]:
            action_taken = True

            # FIX: Pass a standard WorkPreferences object.
            # ScheduleService will automatically fetch and merge the DB preferences internally!
            new_schedule = await self.schedule_service.generate_with_preferences(
                user_id, WorkPreferences()
            )

            # Map the generated schedule to the API doc's "updated_schedule" format
            response_data["updated_schedule"] = [
                item.model_dump(mode="json") for item in new_schedule.schedule
            ]

        # 6. Return strictly formatted according to the API Doc
        return OrdaResponse(
            intent=intent,
            response=ai_summary,
            action_taken=action_taken,
            data=response_data,
        )

    async def get_history(self, user_id: str, limit: int) -> OrdaHistoryResponse:
        return OrdaHistoryResponse(history=[])
