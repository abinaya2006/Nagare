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
                ai_data = ai_response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Module Error: {str(e)}")

        intent = ai_data.get("intent", "info")
        summary = ai_data.get("summary", "I processed your request.")

        # 2. Execute Backend Action based on the AI's Intent
        if intent == "info":
            # Just talking, no schedule needed
            return OrdaResponse(intent=intent, summary=summary, schedule=None)
        
        # If intent is generate_schedule or reschedule, let the backend fetch tasks and call the AI Generator
        schedule = await ScheduleService().generate_with_preferences(user_id, payload.preferences)
        return OrdaResponse(intent=intent, summary=summary, schedule=schedule)