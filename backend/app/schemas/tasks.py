from datetime import datetime, time
from enum import Enum
from uuid import UUID

from app.core.security import sanitize_text
from pydantic import BaseModel, Field, field_validator, model_validator


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"  # ← add this


class TaskStatus(str, Enum):
    pending = "pending"
    scheduled = "scheduled"
    completed = "completed"


class TaskSort(str, Enum):
    deadline = "deadline"
    priority = "priority"


def normalize_enum_value(value: str | Enum | None) -> str | Enum | None:
    if isinstance(value, str):
        return value.strip().lower()
    return value


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = ""
    deadline: datetime | None = None
    estimated_duration_minutes: int = Field(ge=5, le=1440)
    priority: Priority = Priority.medium
    status: TaskStatus = TaskStatus.pending
    is_routine: bool = False
    recurrence_rule: str | None = Field(default=None, max_length=500)
    fixed_start_time: time | None = None
    fixed_end_time: time | None = None

    @field_validator("fixed_start_time", "fixed_end_time", mode="before")
    @classmethod
    def fix_supabase_time_format(cls, v):
        if isinstance(v, str):
            # If Supabase sends '+00' without the minutes, add ':00' to satisfy Pydantic
            if v.endswith("+00"):
                return v + ":00"
            # Or if it's sending timezone data we don't need for basic time, just strip it:
            # return v.split("+")[0].split("-")[0]
        return v

    @field_validator("title", "description")
    @classmethod
    def clean_text(cls, value: str) -> str:
        return sanitize_text(value, 2000)

    @field_validator("recurrence_rule")
    @classmethod
    def clean_recurrence_rule(cls, value: str | None) -> str | None:
        return sanitize_text(value, 500) if value is not None else value

    @field_validator("priority", "status", mode="before")
    @classmethod
    def normalize_choice(cls, value: str | Enum | None) -> str | Enum | None:
        return normalize_enum_value(value)

    @model_validator(mode="after")
    def validate_fixed_time_block(self):
        if (self.fixed_start_time is None) != (self.fixed_end_time is None):
            raise ValueError(
                "fixed_start_time and fixed_end_time must be provided together"
            )
        if (
            self.fixed_start_time
            and self.fixed_end_time
            and self.fixed_end_time <= self.fixed_start_time
        ):
            raise ValueError("fixed_end_time must be after fixed_start_time")
        if self.recurrence_rule and not self.is_routine:
            raise ValueError("recurrence_rule requires is_routine to be true")
        return self


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    description: str | None = None
    deadline: datetime | None = None
    estimated_duration_minutes: int | None = Field(default=None, ge=5, le=1440)
    priority: Priority | None = None
    status: TaskStatus | None = None
    is_routine: bool | None = None
    recurrence_rule: str | None = Field(default=None, max_length=500)
    fixed_start_time: time | None = None
    fixed_end_time: time | None = None

    @field_validator("title", "description")
    @classmethod
    def clean_optional_text(cls, value: str | None) -> str | None:
        return sanitize_text(value, 2000) if value is not None else value

    @field_validator("recurrence_rule")
    @classmethod
    def clean_optional_recurrence_rule(cls, value: str | None) -> str | None:
        return sanitize_text(value, 500) if value is not None else value

    @field_validator("priority", "status", mode="before")
    @classmethod
    def normalize_optional_choice(cls, value: str | Enum | None) -> str | Enum | None:
        return normalize_enum_value(value)


class Task(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    tasks: list[Task]


class TaskResponse(BaseModel):
    task: Task


class TaskMutationResponse(BaseModel):
    message: str
    task: Task | None = None


class TaskMessageResponse(BaseModel):
    message: str
