from pydantic import BaseModel, Field
from typing import Literal
from pydantic import BaseModel, Field

class WorkPreferences(BaseModel):
    workday_start: str = Field(default="09:00", description="Start of workday in HH:MM")
    workday_end: str = Field(default="17:00", description="End of workday in HH:MM")
    productivity_period: str = Field(default="morning", max_length=40)