from app.repositories.schedules import ScheduleRepository
from app.schemas.schedules import ScheduleGenerateRequest, ScheduleOutput
from app.services.ai.factory import get_ai_provider
from app.services.tasks import TaskService


class ScheduleService:
    def __init__(self) -> None:
        self.tasks = TaskService()
        self.repo = ScheduleRepository()
        self.ai = get_ai_provider()

    async def generate(self, user_id: str, payload: ScheduleGenerateRequest) -> ScheduleOutput:
        tasks = payload.tasks or self.tasks.list_tasks(user_id)
        output = await self.ai.generate_schedule(tasks, payload.preferences)
        self.repo.create(user_id, output, source="ai")
        return output

    async def reschedule(self, user_id: str, payload: ScheduleGenerateRequest) -> ScheduleOutput:
        return await self.generate(user_id, payload)

