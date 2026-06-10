from datetime import datetime
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from app.core.security import sanitize_text


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, Enum):
    pending = "Pending"
    scheduled = "Scheduled"
    completed = "Completed"


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    deadline: datetime | None = None
    estimated_duration_minutes: int = Field(ge=5, le=1440)
    priority: Priority = Priority.medium
    status: TaskStatus = TaskStatus.pending

    @field_validator("title", "description")
    @classmethod
    def clean_text(cls, value: str) -> str:
        return sanitize_text(value, 2000)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    deadline: datetime | None = None
    estimated_duration_minutes: int | None = Field(default=None, ge=5, le=1440)
    priority: Priority | None = None
    status: TaskStatus | None = None

    @field_validator("title", "description")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        return sanitize_text(value, 2000) if value is not None else value


class Task(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

