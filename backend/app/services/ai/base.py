from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional

from app.schemas.schedules import ScheduleOutput, WorkPreferences
from app.schemas.tasks import Task


class AIHealthTracker:
    """
    In-memory tracker for the last AI call's outcome.
    Resets on server restart — fine for an MVP maintainability panel.
    Providers call `.record(...)` themselves so "used fallback" can be
    distinguished from a clean AI success, without changing the existing
    contract that generate_schedule() never raises.
    """
    def __init__(self):
        self.last_call_at: Optional[datetime] = None
        self.last_success: Optional[bool] = None
        self.last_latency_ms: Optional[float] = None
        self.last_error: Optional[str] = None
        self.used_fallback: Optional[bool] = None
        self.total_calls: int = 0
        self.total_failures: int = 0

    def record(self, success: bool, latency_ms: float, error: Optional[str] = None, used_fallback: bool = False):
        self.last_call_at = datetime.now(timezone.utc)
        self.last_success = success
        self.last_latency_ms = latency_ms
        self.last_error = error
        self.used_fallback = used_fallback
        self.total_calls += 1
        if not success:
            self.total_failures += 1

    def snapshot(self) -> dict:
        return {
            "last_call_at": self.last_call_at.isoformat() if self.last_call_at else None,
            "last_success": self.last_success,
            "last_latency_ms": self.last_latency_ms,
            "last_error": self.last_error,
            "used_fallback": self.used_fallback,
            "total_calls": self.total_calls,
            "total_failures": self.total_failures,
        }


# Module-level singleton — shared across all provider instances
ai_health_tracker = AIHealthTracker()


class AIProvider(ABC):
    """
    Base class for AI providers (DeepSeek, Gemini, etc).
    provider_name / model_name are set by subclasses so the maintainability
    panel can display which provider+model is actually active.
    """
    provider_name: str = "unknown"
    model_name: str = "unknown"

    @abstractmethod
    async def generate_schedule(self, tasks: list[Task], preferences: WorkPreferences) -> ScheduleOutput:
        raise NotImplementedError
