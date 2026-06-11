from pydantic import BaseModel, Field
from typing import Any, Optional

class AIResponseWrapper(BaseModel):
    """A standard global wrapper for all AI Module output variations to ensure uniform handling."""
    success: bool = Field(..., description="Indicates if the operation completed without validation failure")
    error_message: Optional[str] = Field(None, description="Error payload details if validation or generation failed")
    payload: Optional[Any] = Field(None, description="The valid return data (e.g., ScheduleOutputSchema or ORDAOutputSchema)")