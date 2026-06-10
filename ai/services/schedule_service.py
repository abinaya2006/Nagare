from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from ..models.schedule import ScheduleItem, ScheduleOutput
from ..prompts.schedule_generation import SCHEDULE_GENERATION_SYSTEM_PROMPT
from ..schemas.schedule_schema import ScheduleGenerateRequest
from ..services.gemini_service import gemini_service

# ---------------------------------------------------------------------------
# Priority & energy helpers
# ---------------------------------------------------------------------------

PRIORITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3}

# Map energy level → preferred hour to start (24h)
ENERGY_START_HOUR = {"High": 8, "Medium": 13, "Low": 17}

WORKDAY_START = 8  # 08:00
WORKDAY_END = 21  # 21:00


def _rule_based_schedule(request: ScheduleGenerateRequest) -> ScheduleOutput:
    """
    Deterministic fallback scheduler. No AI required.

    Strategy:
      1. Sort tasks by priority, then by deadline (earliest first).
      2. Prefer starting high-energy tasks in the morning, medium in the
         afternoon, low in the evening — but never before 'now'.
      3. Pack tasks sequentially with a 10-minute buffer between them.
      4. Split tasks that would exceed WORKDAY_END into the next day.
    """
    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    tasks = request.tasks or []
    routine_tasks = request.routine_tasks or []

    if not tasks and not routine_tasks:
        return ScheduleOutput(
            schedule=[],
            justification="No tasks to schedule right now — enjoy the free time!",
        )

    # --- sort pending tasks ---
    sorted_tasks = sorted(
        tasks,
        key=lambda t: (
            PRIORITY_ORDER.get(getattr(t, "priority", "medium"), 2),
            getattr(t, "deadline", None) or "9999-12-31",
        ),
    )

    schedule: list[ScheduleItem] = []
    # cursor tracks where the next task can start
    cursor = now.replace(second=0, microsecond=0) + timedelta(minutes=1)

    # Clamp cursor to workday start if we're before 08:00
    if cursor.hour < WORKDAY_START:
        cursor = cursor.replace(hour=WORKDAY_START, minute=0)

    BUFFER = timedelta(minutes=10)
    DAY_END_HOUR = WORKDAY_END

    for task in sorted_tasks:
        duration_minutes: int = getattr(task, "estimated_duration_minutes", 30) or 30
        energy: str = getattr(task, "energy", "Medium") or "Medium"
        task_id: str = str(getattr(task, "id", "unknown"))
        task_title: str = getattr(task, "title", "Untitled Task")

        # Nudge cursor to preferred energy slot if we haven't passed it yet
        preferred_hour = ENERGY_START_HOUR.get(energy, 13)
        preferred_start = cursor.replace(hour=preferred_hour, minute=0, second=0)
        if preferred_start > cursor:
            cursor = preferred_start

        remaining_minutes = duration_minutes

        while remaining_minutes > 0:
            # How many minutes left in the workday from cursor?
            day_end = cursor.replace(hour=DAY_END_HOUR, minute=0, second=0)
            available = int((day_end - cursor).total_seconds() / 60)

            if available <= 0:
                # Roll over to next workday
                cursor = (cursor + timedelta(days=1)).replace(
                    hour=WORKDAY_START, minute=0, second=0
                )
                continue

            chunk = min(remaining_minutes, available)
            start = cursor
            end = cursor + timedelta(minutes=chunk)

            schedule.append(
                ScheduleItem(
                    task_id=task_id,
                    task_title=task_title
                    + (
                        " (Part 1)"
                        if chunk < duration_minutes
                        and remaining_minutes == duration_minutes
                        else " (cont.)"
                        if chunk < remaining_minutes
                        else ""
                    ),
                    start_time=start,
                    end_time=end,
                )
            )

            remaining_minutes -= chunk
            cursor = end + BUFFER  # 10-min buffer after each chunk

            if remaining_minutes > 0:
                # Split: roll to next day
                cursor = (cursor + timedelta(days=1)).replace(
                    hour=WORKDAY_START, minute=0, second=0
                )

    justification = (
        f"Scheduled {len(sorted_tasks)} task(s) by priority and deadline using "
        "smart time-blocking. High-energy work is placed in the morning, lighter "
        "tasks later in the day, with 10-minute buffers between each block."
    )

    return ScheduleOutput(schedule=schedule, justification=justification)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------


class ScheduleService:
    def generate_schedule(self, request: ScheduleGenerateRequest) -> ScheduleOutput:
        """
        Tries Gemini first. Falls back to rule-based scheduling if the API
        quota is exhausted or any other error occurs.
        """
        request_json_str = request.model_dump_json()
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M")

        user_prompt = (
            f"Please generate an optimized schedule.\n"
            f"IMPORTANT RULES:\n"
            f"1. The current date and exact time right now is {current_datetime}.\n"
            f"2. You MUST NOT schedule any task to start before {current_datetime}. Start scheduling from now.\n"
            f"3. If a task's deadline is mathematically impossible to meet from the current time, just schedule it as soon as possible.\n"
            f"4. If a task's estimated duration is longer than the remaining time in the day, you are allowed to SPLIT the task. Output the same task_id twice in the schedule array (e.g., Part 1 today until workday_end, and Part 2 tomorrow at workday_start) until the full duration is met.\n"
            f"5. Add a 10-minute buffer (empty time) between tasks. Do not add the 10-minute buffer if the preceding or succeeding task is a routine break (e.g., Lunch, Tea break, Dinner, etc.).\n\n"
            f"User Data:\n{request_json_str}"
        )

        try:
            return gemini_service.generate_structured_response(
                system_prompt=SCHEDULE_GENERATION_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                response_schema=ScheduleOutput,
            )
        except Exception as e:
            print(
                f"[ScheduleService] Gemini failed ({e}), falling back to rule-based scheduler."
            )
            return _rule_based_schedule(request)


schedule_service = ScheduleService()
