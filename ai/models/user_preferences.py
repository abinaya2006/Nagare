from typing import Any, Dict, List, Literal

from pydantic import BaseModel, ConfigDict, Field


class RoutineTask(BaseModel):
    title: str
    start_time: str
    end_time: str
    days: List[str] = ["daily"]
    is_active: bool = True


class WorkPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")

    workday_start: str = Field(default="09:00")
    workday_end: str = Field(default="17:00")
    productivity_period: str = Field(default="morning")
    allow_weekends: bool = Field(default=False)
    buffer_minutes: int = Field(default=10)
    lunch: Dict[str, Any] | None = None
    breaks: list[Dict[str, Any]] | None = None
    routine_tasks: List[RoutineTask] = Field(default_factory=list)  # ← add this
