from fastapi import APIRouter
from app.dependencies.auth import CurrentUser
from app.schemas.schedules import (
    CurrentScheduleResponse,
    ScheduleGenerateRequest,
    ScheduleOutput,
    ScheduleRescheduleRequest,
    UpdatedScheduleResponse,
)
from app.services.schedules import ScheduleService

router = APIRouter(prefix="/api/v1/schedule", tags=["schedule"])


@router.post("/generate", response_model=ScheduleOutput)
async def generate_schedule(payload: ScheduleGenerateRequest, user=CurrentUser) -> ScheduleOutput:
    return await ScheduleService().generate(user.id, payload)


@router.get("", response_model=CurrentScheduleResponse)
def get_current_schedule(user=CurrentUser) -> CurrentScheduleResponse:
    output = ScheduleService().get_current(user.id)
    return CurrentScheduleResponse(schedule=output.schedule, unscheduled_tasks=output.unscheduled_tasks)


@router.post("/reschedule", response_model=UpdatedScheduleResponse)
async def reschedule(payload: ScheduleRescheduleRequest, user=CurrentUser) -> UpdatedScheduleResponse:
    output = await ScheduleService().reschedule(user.id, payload)
    return UpdatedScheduleResponse(updated_schedule=output.schedule, unscheduled_tasks=output.unscheduled_tasks)

