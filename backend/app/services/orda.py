import httpx
from fastapi import HTTPException
from app.schemas.orda import ORDARequest, OrdaResponse
from app.services.schedules import ScheduleService
from app.services.tasks import TaskService
from app.schemas.tasks import TaskUpdate

class OrdaService:
    async def process(self, user_id: str, payload: ORDARequest) -> OrdaResponse:
        # 1. Ask the AI Module for the intent and summary
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                ai_response = await client.post(
                    "http://127.0.0.1:8000/api/ai/orda/chat",
                    json=payload.model_dump(mode="json")
                )
                ai_response.raise_for_status()
                ai_data = ai_response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI ORDA Error: {str(e)}")

        intent = ai_data.get("intent", "info")
        summary = ai_data.get("summary", "I processed your request.")

        # 2. Execute Backend Action based on the AI's Intent
        if intent == "info":
            # Just talking or asking a question, no schedule generation needed
            return OrdaResponse(intent=intent, summary=summary, schedule=None)
        
        # 3. If intent is generate_schedule or reschedule, trigger the backend's schedule generator
        # (This will automatically call the OTHER AI endpoint via services/schedules.py)
        schedule = await ScheduleService().generate_with_preferences(user_id, payload.preferences)
        return OrdaResponse(intent=intent, summary=summary, schedule=schedule)