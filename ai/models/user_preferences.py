from pydantic import BaseModel, Field, ConfigDict
from typing import Literal, Dict, Any

class WorkPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore") # Safely ignore any weird extra fields backend sends
    
    workday_start: str = Field(default="09:00")
    workday_end: str = Field(default="17:00")
    productivity_period: str = Field(default="morning")
    
    # New Backend Features
    allow_weekends: bool = Field(default=False)
    buffer_minutes: int = Field(default=10)
    lunch: Dict[str, Any] | None = None
    breaks: list[Dict[str, Any]] | None = None