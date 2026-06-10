from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.tasks import Task


class WorkPreferences(BaseModel):
    workday_start: str = Field(default="09:00", pattern=r"^\d{2}:\d{2}$")
    workday_end: str = Field(default="17:00", pattern=r"^\d{2}:\d{2}$")
    productivity_period: str = Field(default="morning", max_length=40)


class ScheduleItem(BaseModel):
    task_id: str
    task_title: str
    start_time: datetime
    end_time: datetime


class ScheduleOutput(BaseModel):
    schedule: list[ScheduleItem]


class ScheduleGenerateRequest(BaseModel):
    tasks: list[Task] | None = None
    preferences: WorkPreferences = WorkPreferences()


class ScheduleCreate(BaseModel):
    schedule_date: date
    items: list[ScheduleItem]
    source: str


class ScheduleRecord(BaseModel):
    id: UUID
    user_id: UUID
    schedule_date: date
    items: list[ScheduleItem]
    source: str
    created_at: datetime
    updated_at: datetime

