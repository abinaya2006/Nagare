from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum
from uuid import UUID

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskStatus(str, Enum):
    pending = "Pending"
    scheduled = "Scheduled"
    completed = "Completed"

class Task(BaseModel):
    id: UUID
    user_id: UUID
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    deadline: datetime | None = None
    estimated_duration_minutes: int = Field(ge=5, le=1440)
    priority: Priority = Priority.medium
    status: TaskStatus = TaskStatus.pending
    created_at: datetime
    updated_at: datetime

    @field_validator("status", mode="before")
    @classmethod
    def fix_status_case(cls, v):
        if isinstance(v, str):
            return v.capitalize()
        return v