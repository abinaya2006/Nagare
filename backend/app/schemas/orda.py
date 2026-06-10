from pydantic import BaseModel, Field
from app.schemas.schedules import ScheduleOutput, WorkPreferences


class OrdaRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    preferences: WorkPreferences = WorkPreferences()


class OrdaResponse(BaseModel):
    intent: str
    summary: str
    schedule: ScheduleOutput | None = None

