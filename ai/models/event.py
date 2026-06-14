from pydantic import BaseModel, Field
from typing import List

class RoutineTask(BaseModel):
    """Represents fixed daily recurring habits (e.g., Lunch, Commute) that happen at the same time every day."""
    title: str = Field(..., description="Name of the routine (e.g., Lunch, Tea Break)")
    start_time: str = Field(..., description="Fixed start time in HH:MM format (e.g., 13:00)")
    end_time: str = Field(..., description="Fixed end time in HH:MM format (e.g., 14:00)")
    days: List[str] | None = Field(default=None, description="Days this routine applies to (e.g. ['monday', 'wednesday'] or ['daily'])")