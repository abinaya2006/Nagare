from datetime import date, datetime, time
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.tasks import Task


class TimeBlock(BaseModel):
    start: time
    end: time

    @model_validator(mode="after")
    def validate_time_order(self):
        if self.end <= self.start:
            raise ValueError("end must be after start")
        return self


class WorkPreferences(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    workday_start: time = time(9, 0)
    workday_end: time = time(17, 0)
    productivity_preference: str = Field(default="morning", max_length=40, alias="productivity_period")
    lunch: TimeBlock | None = Field(default_factory=lambda: TimeBlock(start=time(13, 0), end=time(14, 0)))
    breaks: list[TimeBlock] = Field(default_factory=list)
    buffer_minutes: int = Field(default=10, ge=0, le=60)
    max_daily_tasks: int = Field(default=6, ge=1, le=20)
    split_task_threshold_minutes: int = Field(default=120, ge=30, le=480)
    allow_weekends: bool = False
    timezone: str = "UTC"

    @model_validator(mode="after")
    def validate_workday(self):
        if self.workday_end <= self.workday_start:
            raise ValueError("workday_end must be after workday_start")
        return self


class ScheduleItem(BaseModel):
    task_id: str
    task_title: str
    start_time: datetime
    end_time: datetime
    part: int | None = None
    total_parts: int | None = None


class UnscheduledTask(BaseModel):
    task_id: str
    task_title: str
    reason: str


class ScheduleOutput(BaseModel):
    schedule: list[ScheduleItem]
    unscheduled_tasks: list[UnscheduledTask] = Field(default_factory=list)
    justification: str | None = None  


class ScheduleGenerateRequest(BaseModel):
    available_hours: list[TimeBlock] = Field(min_length=1)
    productivity_preference: str = Field(max_length=40)


class ScheduleEvent(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def validate_event_time_order(self):
        if self.end_time <= self.start_time:
            raise ValueError("event end_time must be after start_time")
        return self


class ScheduleRescheduleRequest(BaseModel):
    reason: str = Field(min_length=1, max_length=500)
    event: ScheduleEvent


class CurrentScheduleResponse(BaseModel):
    schedule: list[ScheduleItem]
    unscheduled_tasks: list[UnscheduledTask] = Field(default_factory=list)


class UpdatedScheduleResponse(BaseModel):
    updated_schedule: list[ScheduleItem]
    unscheduled_tasks: list[UnscheduledTask] = Field(default_factory=list)


class ScheduleCreate(BaseModel):
    schedule_date: date
    items: list[ScheduleItem]
    source: str


class ScheduleRecord(BaseModel):
    id: UUID
    user_id: UUID
    schedule_date: date
    items: list[ScheduleItem]
    unscheduled_items: list[UnscheduledTask] = Field(default_factory=list)
    source: str
    created_at: datetime
    updated_at: datetime

