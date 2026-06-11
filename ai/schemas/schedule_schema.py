from pydantic import BaseModel, Field
from typing import List
from ..models.task import Task
from ..models.user_preferences import WorkPreferences

class ScheduleGenerateRequest(BaseModel):
    """Validates incoming requests from the backend to trigger schedule generation."""
    tasks: list[Task] | None = None
    preferences: WorkPreferences = WorkPreferences()