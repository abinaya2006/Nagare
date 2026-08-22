from fastapi import FastAPI, HTTPException
from ai.schemas.schedule_schema import ScheduleGenerateRequest
from ai.schemas.orda_schema import ORDARequest, OrdaResponse
from ai.models.schedule import ScheduleOutput
from ai.services.schedule_service import schedule_service
from ai.services.orda_service import orda_service

app = FastAPI(
    title="Pulse Plan AI Module",
    description="AI generation and ORDA intent routing for the Pulse Plan Hackathon MVP",
    version="1.0.0"
)

@app.post("/api/ai/generate-schedule", response_model=ScheduleOutput)
async def generate_schedule_endpoint(request: ScheduleGenerateRequest):
    """
    Receives tasks and preferences from the backend, 
    and returns a chronologically optimized schedule.
    """
    try:
        schedule = schedule_service.generate_schedule(request)
        return schedule
    except Exception as e:
        # If Gemini fails or validation fails, return a 500 error to the backend
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/orda/chat", response_model=OrdaResponse)
async def orda_chat_endpoint(request: ORDARequest):
    """
    Receives a user chat message, 
    and returns the detected intent and a natural language summary.
    """
    try:
        response = orda_service.process_chat(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint so backend knows the AI server is awake
@app.get("/health")
async def health_check():
    return {"status": "AI Module is running smoothly!"}