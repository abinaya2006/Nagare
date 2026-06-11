from fastapi import APIRouter
from app.dependencies.auth import CurrentUser
from app.schemas.orda import ORDARequest, OrdaResponse
from app.services.orda import OrdaService

router = APIRouter(prefix="/orda", tags=["orda"])


@router.post("/process", response_model=OrdaResponse)
async def process_orda(payload: ORDARequest, user=CurrentUser) -> OrdaResponse:
    return await OrdaService().process(user.id, payload)

