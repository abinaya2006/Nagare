import httpx
from fastapi import HTTPException
from datetime import datetime
from app.schemas.orda import ORDARequest, OrdaResponse
from app.services.schedules import ScheduleService
from app.schemas.schedules import ScheduleRescheduleRequest, ScheduleEvent
from app.services.tasks import TaskService
from app.schemas.tasks import TaskUpdate

class OrdaService:
    async def process(self, user_id: str, payload: ORDARequest) -> OrdaResponse:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
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

        if intent == "info":
            return OrdaResponse(intent=intent, summary=summary, schedule=None)
        
        # Just do a standard schedule generation
        schedule = await ScheduleService().generate_with_preferences(user_id, payload.preferences)
        return OrdaResponse(intent=intent, summary=summary, schedule=schedule)