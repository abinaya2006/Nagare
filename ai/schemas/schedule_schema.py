from pydantic import BaseModel, Field
from typing import List
from ..models.task import Task
from ..models.user_preferences import WorkPreferences
from ai.models.event import RoutineTask  # <-- Import it here

class ScheduleGenerateRequest(BaseModel):
    tasks: list[Task] | None = None
    routine_tasks: list[RoutineTask] | None = None  # <-- Add this! Optional makes it safe to test now.
    preferences: WorkPreferences = WorkPreferences()