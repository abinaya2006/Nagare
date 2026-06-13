from pydantic import BaseModel, Field

class RoutineTask(BaseModel):
    """Represents fixed daily recurring habits (e.g., Lunch, Commute) that happen at the same time every day."""
    title: str = Field(..., description="Name of the routine (e.g., Lunch, Tea Break)")
    start_time: str = Field(..., description="Fixed start time in HH:MM format (e.g., 13:00)")
    end_time: str = Field(..., description="Fixed end time in HH:MM format (e.g., 14:00)")