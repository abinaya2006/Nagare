from fastapi import APIRouter, Depends, Query
from app.dependencies.auth import get_current_user
from app.core.security import AuthUser
from app.schemas.orda import ORDARequest, OrdaResponse, OrdaHistoryResponse
from app.services.orda import OrdaService

# Notice we use the standard prefix defined in your API Doc
router = APIRouter(prefix="/api/v1/orda", tags=["orda"])
orda_service = OrdaService()

@router.post("/process", response_model=OrdaResponse)
async def process_command(payload: ORDARequest, user: AuthUser = Depends(get_current_user)):
    """Process natural language commands via AI."""
    return await orda_service.process(user.id, payload)

@router.get("/history", response_model=OrdaHistoryResponse)
async def get_history(
    limit: int = Query(default=10, ge=1, le=50), 
    user: AuthUser = Depends(get_current_user)
):
    """Retrieve ORDA conversation history."""
    return await orda_service.get_history(user.id, limit)