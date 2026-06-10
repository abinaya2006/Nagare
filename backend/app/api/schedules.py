from fastapi import APIRouter
from app.dependencies.auth import CurrentUser
from app.schemas.schedules import ScheduleGenerateRequest, ScheduleOutput
from app.services.schedules import ScheduleService

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.post("/generate", response_model=ScheduleOutput)
async def generate_schedule(payload: ScheduleGenerateRequest, user=CurrentUser) -> ScheduleOutput:
    return await ScheduleService().generate(user.id, payload)


@router.post("/reschedule", response_model=ScheduleOutput)
async def reschedule(payload: ScheduleGenerateRequest, user=CurrentUser) -> ScheduleOutput:
    return await ScheduleService().reschedule(user.id, payload)

