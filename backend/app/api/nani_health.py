from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/v1/nani", tags=["nani-health"])

@router.get("/health")
async def nani_health():
    try:
        async with httpx.AsyncClient(timeout=3) as client:
            response = await client.get("http://127.0.0.1:8001/health")
            response.raise_for_status()
        return {
            "status": "healthy",
            "ai_service": "reachable"
        }
    except Exception:
        return {
            "status": "unhealthy",
            "ai_service": "unreachable"
        }