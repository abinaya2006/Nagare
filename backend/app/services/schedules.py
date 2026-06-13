from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from fastapi import HTTPException, status
from app.repositories.schedules import ScheduleRepository
from app.schemas.schedules import (
    ScheduleGenerateRequest,
    ScheduleOutput,
    ScheduleRecord,
    ScheduleRescheduleRequest,
    ScheduleItem,
    TimeBlock,
    UnscheduledTask,
    WorkPreferences,
)
from app.services.preferences import PreferencesService
from app.schemas.tasks import Priority, Task, TaskStatus
from app.services.tasks import TaskService


PRIORITY_ORDER = {
    Priority.high: 0,
    Priority.medium: 1,
    Priority.low: 2,
}

SCHEDULE_HORIZON_DAYS = 30


class ScheduleService:
    def __init__(self) -> None:
        self.tasks = TaskService()
        self.preferences = PreferencesService()
        self.repo = ScheduleRepository()

    async def generate(self, user_id: str, payload: ScheduleGenerateRequest) -> ScheduleOutput:
        tasks = self.tasks.list_tasks(user_id)
        preferences = self._preferences_from_generate_request(payload)
        preferences = self._apply_stored_preferences(user_id, preferences)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)
        output = self._build_schedule(tasks, preferences, payload.available_hours, routine_blocks=routine_tasks)
        self.repo.replace_current(user_id, output, source="rules")
        return output

    async def generate_with_preferences(self, user_id: str, preferences: WorkPreferences) -> ScheduleOutput:
        tasks = self.tasks.list_tasks(user_id)
        preferences = self._apply_stored_preferences(user_id, preferences)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)
        output = self._build_schedule(tasks, preferences, None, routine_blocks=routine_tasks)
        self.repo.replace_current(user_id, output, source="rules")
        return output

    def get_current(self, user_id: str) -> ScheduleOutput:
        record = self.repo.latest(user_id)
        if not record:
            return ScheduleOutput(schedule=[], unscheduled_tasks=[])
        schedule_record = ScheduleRecord.model_validate(record)
        return ScheduleOutput(schedule=schedule_record.items, unscheduled_tasks=schedule_record.unscheduled_items)

    async def reschedule(self, user_id: str, payload: ScheduleRescheduleRequest) -> ScheduleOutput:
        tasks = self.tasks.list_tasks(user_id)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)
        preferences = self._apply_stored_preferences(user_id, WorkPreferences())
        output = self._build_schedule(tasks, preferences, None, event=payload.event, routine_blocks=routine_tasks)
        self.repo.replace_current(user_id, output, source="reschedule")
        return output

    async def reschedule_with_preferences(self, user_id: str, preferences: WorkPreferences) -> ScheduleOutput:
        tasks = self.tasks.list_tasks(user_id)
        preferences = self._apply_stored_preferences(user_id, preferences)
        routine_tasks = self.preferences.list_routine_tasks(user_id, active_only=True)
        output = self._build_schedule(tasks, preferences, None, routine_blocks=routine_tasks)
        self.repo.replace_current(user_id, output, source="reschedule")
        return output

    def _preferences_from_generate_request(self, payload: ScheduleGenerateRequest) -> WorkPreferences:
        return WorkPreferences(
            workday_start=payload.available_hours[0].start,
            workday_end=payload.available_hours[-1].end,
            productivity_preference=payload.productivity_preference,
        )

    def _apply_stored_preferences(self, user_id: str, preferences: WorkPreferences) -> WorkPreferences:
        stored = self.preferences.get_user_preferences(user_id)
        if stored and stored.task_count:
            preferences.max_daily_tasks = stored.task_count
        return preferences

    def _build_schedule(
        self,
        tasks: list[Task],
        preferences: WorkPreferences,
        available_hours: list[TimeBlock] | None,
        event=None,
        routine_blocks=None,
    ) -> ScheduleOutput:
        tz = self._timezone(preferences.timezone)

        now = datetime.now(tz).replace(second=0, microsecond=0)
        flexible_tasks = [
            task for task in tasks
            if task.status != TaskStatus.completed and not (task.is_routine and task.fixed_start_time and task.fixed_end_time)
        ]
        flexible_tasks = sorted(
            flexible_tasks,
            key=lambda task: (PRIORITY_ORDER[task.priority], self._deadline_sort_value(task, tz), task.created_at, str(task.id)),
        )

        routine_tasks = [
            task for task in tasks
            if task.status != TaskStatus.completed and task.is_routine and task.fixed_start_time and task.fixed_end_time
        ]

        scheduled: list[ScheduleItem] = []
        unscheduled: list[UnscheduledTask] = []
        task_parts = self._split_tasks(flexible_tasks, preferences.split_task_threshold_minutes)
        part_index = 0
        day_offset = 0

        while part_index < len(task_parts) and day_offset < SCHEDULE_HORIZON_DAYS:
            current_day = now.date() + timedelta(days=day_offset)
            day_offset += 1
            if self._is_blocked_weekend(current_day, preferences.allow_weekends):
                continue

            day_windows = self._day_windows(current_day, tz, preferences, available_hours, now)
            reserved = self._reserved_blocks(current_day, tz, preferences, routine_tasks, event, routine_blocks or [])
            slots = self._available_slots(day_windows, reserved)
            daily_task_count = 0

            for routine_item in self._routine_schedule_items(current_day, tz, routine_tasks, now):
                if not self._overlaps_any(routine_item.start_time, routine_item.end_time, scheduled):
                    scheduled.append(routine_item)

            for slot_start, slot_end in slots:
                cursor = slot_start
                while part_index < len(task_parts) and daily_task_count < preferences.max_daily_tasks:
                    task, duration_minutes, part, total_parts = task_parts[part_index]
                    duration = timedelta(minutes=duration_minutes)
                    if cursor + duration > slot_end:
                        break
                    scheduled.append(ScheduleItem(
                        task_id=str(task.id),
                        task_title=task.title,
                        start_time=cursor,
                        end_time=cursor + duration,
                        part=part if total_parts > 1 else None,
                        total_parts=total_parts if total_parts > 1 else None,
                    ))
                    cursor = cursor + duration + timedelta(minutes=preferences.buffer_minutes)
                    part_index += 1
                    daily_task_count += 1

        for task, _duration_minutes, _part, _total_parts in task_parts[part_index:]:
            if not any(item.task_id == str(task.id) for item in unscheduled):
                unscheduled.append(UnscheduledTask(
                    task_id=str(task.id),
                    task_title=task.title,
                    reason="Task could not fit within scheduling horizon and constraints",
                ))

        return ScheduleOutput(schedule=sorted(scheduled, key=lambda item: item.start_time), unscheduled_tasks=unscheduled)

    def _split_tasks(self, tasks: list[Task], threshold_minutes: int) -> list[tuple[Task, int, int, int]]:
        parts: list[tuple[Task, int, int, int]] = []
        for task in tasks:
            if task.estimated_duration_minutes <= threshold_minutes:
                parts.append((task, task.estimated_duration_minutes, 1, 1))
                continue
            total_parts = (task.estimated_duration_minutes + threshold_minutes - 1) // threshold_minutes
            remaining = task.estimated_duration_minutes
            for part in range(1, total_parts + 1):
                duration = min(threshold_minutes, remaining)
                parts.append((task, duration, part, total_parts))
                remaining -= duration
        return parts

    def _day_windows(
        self,
        current_day: date,
        tz: ZoneInfo,
        preferences: WorkPreferences,
        available_hours: list[TimeBlock] | None,
        now: datetime,
    ) -> list[tuple[datetime, datetime]]:
        blocks = available_hours or [TimeBlock(start=preferences.workday_start, end=preferences.workday_end)]
        windows = []
        for block in blocks:
            start = self._combine(current_day, block.start, tz)
            end = self._combine(current_day, block.end, tz)
            if current_day == now.date():
                start = max(start, now)
            if end > start:
                windows.append((start, end))
        return windows

    def _reserved_blocks(
        self,
        current_day: date,
        tz: ZoneInfo,
        preferences: WorkPreferences,
        routine_tasks: list[Task],
        event,
        routine_blocks,
    ) -> list[tuple[datetime, datetime]]:
        blocks = []
        if preferences.lunch:
            blocks.append((self._combine(current_day, preferences.lunch.start, tz), self._combine(current_day, preferences.lunch.end, tz)))
        for break_block in preferences.breaks:
            blocks.append((self._combine(current_day, break_block.start, tz), self._combine(current_day, break_block.end, tz)))
        for task in routine_tasks:
            blocks.append((self._combine(current_day, task.fixed_start_time, tz), self._combine(current_day, task.fixed_end_time, tz)))
        for routine in routine_blocks:
            if self._routine_applies_to_day(routine.days, current_day):
                blocks.append((self._combine(current_day, routine.start_time, tz), self._combine(current_day, routine.end_time, tz)))
        if event:
            event_start = self._as_timezone(event.start_time, tz)
            event_end = self._as_timezone(event.end_time, tz)
            if event_start.date() == current_day:
                blocks.append((event_start, event_end))
        return sorted(blocks)

    def _routine_schedule_items(self, current_day: date, tz: ZoneInfo, routine_tasks: list[Task], now: datetime) -> list[ScheduleItem]:
        items = []
        for task in routine_tasks:
            start = self._combine(current_day, task.fixed_start_time, tz)
            end = self._combine(current_day, task.fixed_end_time, tz)
            if end <= now:
                continue
            items.append(ScheduleItem(task_id=str(task.id), task_title=task.title, start_time=start, end_time=end))
        return items

    def _available_slots(
        self,
        windows: list[tuple[datetime, datetime]],
        reserved: list[tuple[datetime, datetime]],
    ) -> list[tuple[datetime, datetime]]:
        slots = []
        for window_start, window_end in windows:
            cursor = window_start
            for block_start, block_end in reserved:
                if block_end <= cursor or block_start >= window_end:
                    continue
                if block_start > cursor:
                    slots.append((cursor, min(block_start, window_end)))
                cursor = max(cursor, block_end)
            if cursor < window_end:
                slots.append((cursor, window_end))
        return slots

    def _combine(self, value_date: date, value_time: time, tz: ZoneInfo) -> datetime:
        return datetime.combine(value_date, value_time, tzinfo=tz)

    def _timezone(self, timezone_name: str):
        if timezone_name.upper() == "UTC":
            return timezone.utc
        try:
            return ZoneInfo(timezone_name)
        except ZoneInfoNotFoundError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid timezone") from exc

    def _as_timezone(self, value: datetime, tz: ZoneInfo) -> datetime:
        if value.tzinfo is None:
            return value.replace(tzinfo=tz)
        return value.astimezone(tz)

    def _deadline_sort_value(self, task: Task, tz: ZoneInfo) -> datetime:
        if not task.deadline:
            return datetime.max.replace(tzinfo=tz)
        return self._as_timezone(task.deadline, tz)

    def _is_blocked_weekend(self, current_day: date, allow_weekends: bool) -> bool:
        return not allow_weekends and current_day.weekday() >= 5

    def _overlaps_any(self, start: datetime, end: datetime, items: list[ScheduleItem]) -> bool:
        return any(start < item.end_time and end > item.start_time for item in items)

    def _routine_applies_to_day(self, days: str, current_day: date) -> bool:
        if isinstance(days, list):
            normalized = {str(part).strip().lower() for part in days if str(part).strip()}
        else:
            normalized = {part.strip().lower() for part in days.split(",") if part.strip()}
        if not normalized or "daily" in normalized or "all" in normalized:
            return True
        weekday_name = current_day.strftime("%A").lower()
        weekday_short = current_day.strftime("%a").lower()
        return weekday_name in normalized or weekday_short in normalized

