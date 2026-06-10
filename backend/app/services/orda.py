from app.schemas.orda import OrdaRequest, OrdaResponse
from app.schemas.schedules import ScheduleGenerateRequest
from app.schemas.tasks import TaskUpdate
from app.services.schedules import ScheduleService
from app.services.tasks import TaskService


class OrdaService:
    async def process(self, user_id: str, payload: OrdaRequest) -> OrdaResponse:
        message = payload.message.lower()
        tasks = TaskService().list_tasks(user_id)

        if "finished" in message or "done" in message or "completed" in message:
            if tasks:
                TaskService().update_task(user_id, str(tasks[0].id), TaskUpdate(status="Completed"))
            schedule = await ScheduleService().reschedule(user_id, ScheduleGenerateRequest(preferences=payload.preferences))
            return OrdaResponse(intent="task_completed", summary="Marked the most relevant task complete and refreshed your schedule.", schedule=schedule)

        if "move" in message or "tomorrow" in message or "reschedule" in message or "meeting" in message:
            schedule = await ScheduleService().reschedule(user_id, ScheduleGenerateRequest(preferences=payload.preferences))
            return OrdaResponse(intent="reschedule", summary="Adjusted the plan around the new constraint.", schedule=schedule)

        schedule = await ScheduleService().generate(user_id, ScheduleGenerateRequest(preferences=payload.preferences))
        return OrdaResponse(intent="generate_schedule", summary="Generated a schedule from your current tasks.", schedule=schedule)

