from pydantic import BaseModel
from typing import Any, Dict, List

class ORDARequest(BaseModel):
    message: str

class OrdaResponse(BaseModel):
    intent: str
    response: str
    action_taken: bool
    data: Dict[str, Any]

class OrdaHistoryItem(BaseModel):
    id: str
    message: str
    response: str
    timestamp: str

class OrdaHistoryResponse(BaseModel):
    history: List[OrdaHistoryItem]