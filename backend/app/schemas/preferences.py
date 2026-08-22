from datetime import datetime, time
from typing import List
from uuid import UUID

from app.core.security import sanitize_text
from pydantic import BaseModel, Field, field_validator, model_validator

lunch_start: time | None = None
lunch_end: time | None = None


@model_validator(mode="after")
def validate_lunch_order(self):
    if (
        self.lunch_start is not None
        and self.lunch_end is not None
        and self.lunch_end <= self.lunch_start
    ):
        raise ValueError("lunch_end must be after lunch_start")
    return self


class RoutineTaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    start_time: time
    end_time: time
    days: List[str] = Field(default_factory=lambda: ["daily"])
    is_active: bool = True

    @field_validator("days", mode="before")
    @classmethod
    def normalize_days_input(cls, value):
        if isinstance(value, str):
            return [day.strip() for day in value.split(",") if day.strip()]
        return value

    @model_validator(mode="after")
    def validate_time_order(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")

        self.title = sanitize_text(self.title, 160)
        self.days = [sanitize_text(day, 20) for day in self.days]

        return self


class RoutineTaskCreate(RoutineTaskBase):
    pass


class RoutineTaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    start_time: time | None = None
    end_time: time | None = None
    days: List[str] = Field(default_factory=lambda: ["daily"])
    is_active: bool | None = None

    @field_validator("days", mode="before")
    @classmethod
    def normalize_optional_days_input(cls, value):
        if isinstance(value, str):
            return [day.strip() for day in value.split(",") if day.strip()]
        return value

    @model_validator(mode="after")
    def clean_values(self):
        if self.title is not None:
            self.title = sanitize_text(self.title, 160)

        if self.days is not None:
            self.days = [sanitize_text(day, 20) for day in self.days]

        if (
            self.start_time is not None
            and self.end_time is not None
            and self.end_time <= self.start_time
        ):
            raise ValueError("end_time must be after start_time")

        return self


class RoutineTask(RoutineTaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime


class UserPreferencesBase(BaseModel):
    productivity_period: str | None = Field(default=None, max_length=40)
    work_style: str | None = Field(default=None, max_length=80)
    focus_duration_minutes: int | None = Field(default=None, ge=15, le=180)
    break_preference: str | None = Field(default=None, max_length=80)
    sleep_hours: str | None = Field(default=None, max_length=80)
    task_count: int | None = Field(default=None, ge=1, le=50)

    @model_validator(mode="after")
    def clean_text_fields(self):
        for field_name in (
            "productivity_period",
            "work_style",
            "break_preference",
            "sleep_hours",
        ):
            value = getattr(self, field_name)
            if value is not None:
                setattr(self, field_name, sanitize_text(value, 120))
        return self


class UserPreferencesUpsert(UserPreferencesBase):
    routine_tasks: list[RoutineTaskCreate] = Field(default_factory=list)


class UserPreferences(UserPreferencesBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class PreferencesResponse(BaseModel):
    preferences: UserPreferences | None
    routine_tasks: list[RoutineTask] = Field(default_factory=list)


class PreferencesMutationResponse(BaseModel):
    message: str
    preferences: UserPreferences
    routine_tasks: list[RoutineTask] = Field(default_factory=list)


class RoutineTaskListResponse(BaseModel):
    routine_tasks: list[RoutineTask]


class RoutineTaskResponse(BaseModel):
    message: str
    routine_task: RoutineTask


class RoutineTaskMessageResponse(BaseModel):
    message: str
