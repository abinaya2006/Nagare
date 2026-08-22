from pydantic import BaseModel, Field
from typing import Literal, Dict, Any
from ..models.user_preferences import WorkPreferences
from ..models.schedule import ScheduleOutput

class ORDARequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    preferences: WorkPreferences = WorkPreferences()

class OrdaResponse(BaseModel):
    intent: str
    summary: str
    schedule: ScheduleOutput | None = None