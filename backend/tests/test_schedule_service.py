from datetime import datetime, timedelta, timezone
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.schemas.schedules import TimeBlock, WorkPreferences
from app.schemas.preferences import RoutineTask
from app.schemas.tasks import Priority, Task, TaskStatus
from app.services.schedules import ScheduleService, SCHEDULE_HORIZON_DAYS


def make_task(title: str, duration: int = 30, priority: Priority = Priority.medium) -> Task:
    now = datetime.now(timezone.utc)
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        title=title,
        description="",
        deadline=now + timedelta(days=3),
        estimated_duration_minutes=duration,
        priority=priority,
        status=TaskStatus.pending,
        created_at=now,
        updated_at=now,
    )


def test_empty_schedule_request_returns_empty_schedule() -> None:
    output = ScheduleService()._build_schedule(
        [],
        WorkPreferences(allow_weekends=True, workday_start="00:00", workday_end="23:59", lunch=None),
        None,
    )

    assert output.schedule == []
    assert output.unscheduled_tasks == []


def test_scheduler_never_schedules_in_the_past() -> None:
    output = ScheduleService()._build_schedule(
        [make_task("Now-safe")],
        WorkPreferences(allow_weekends=True, workday_start="00:00", workday_end="23:59", lunch=None),
        None,
    )

    assert output.schedule
    assert output.schedule[0].start_time >= datetime.now(timezone.utc).replace(second=0, microsecond=0)


def test_scheduler_splits_long_tasks() -> None:
    output = ScheduleService()._build_schedule(
        [make_task("Long task", duration=250)],
        WorkPreferences(
            allow_weekends=True,
            workday_start="00:00",
            workday_end="23:59",
            lunch=None,
            split_task_threshold_minutes=120,
        ),
        None,
    )

    assert len(output.schedule) == 3
    assert output.schedule[0].part == 1
    assert output.schedule[0].total_parts == 3


def test_scheduler_returns_unscheduled_tasks() -> None:
    tasks = [make_task(f"Task {index}") for index in range(SCHEDULE_HORIZON_DAYS + 1)]
    output = ScheduleService()._build_schedule(
        tasks,
        WorkPreferences(
            allow_weekends=True,
            workday_start="00:00",
            workday_end="23:59",
            lunch=None,
            max_daily_tasks=1,
        ),
        None,
    )

    assert output.unscheduled_tasks


def test_invalid_timezone_returns_400() -> None:
    with pytest.raises(HTTPException) as exc:
        ScheduleService()._build_schedule(
            [make_task("Task")],
            WorkPreferences(timezone="Not/AZone"),
            [TimeBlock(start="09:00", end="10:00")],
        )

    assert exc.value.status_code == 400
    assert exc.value.detail == "Invalid timezone"


def test_scheduler_reserves_routine_task_blocks() -> None:
    routine = RoutineTask(
        id=uuid4(),
        user_id=uuid4(),
        title="Class",
        start_time="00:00",
        end_time="23:59",
        days="daily",
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )

    output = ScheduleService()._build_schedule(
        [make_task("Flexible task")],
        WorkPreferences(allow_weekends=True, workday_start="00:00", workday_end="23:59", lunch=None),
        None,
        routine_blocks=[routine],
    )

    assert output.schedule == []
    assert output.unscheduled_tasks
