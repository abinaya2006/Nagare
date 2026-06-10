from abc import ABC, abstractmethod
from app.schemas.schedules import ScheduleOutput, WorkPreferences
from app.schemas.tasks import Task


class AIProvider(ABC):
    @abstractmethod
    async def generate_schedule(self, tasks: list[Task], preferences: WorkPreferences) -> ScheduleOutput:
        raise NotImplementedError

