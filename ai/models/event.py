from pydantic import BaseModel, Field
from datetime import datetime

class Event(BaseModel):
    """Represents existing fixed calendar events or blocks that the AI must schedule around."""
    title: str = Field(..., description="Name of the fixed calendar event")
    start_time: datetime = Field(..., description="Event start timestamp")
    end_time: datetime = Field(..., description="Event end timestamp")