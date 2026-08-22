from pydantic import BaseModel, Field
from datetime import datetime
from typing import List

class ScheduleItem(BaseModel):
    task_id: str = Field(..., description="The ID of the allocated task")
    task_title: str = Field(..., description="The title of the allocated task")
    start_time: datetime = Field(..., description="Scheduled start time for the task")
    end_time: datetime = Field(..., description="Scheduled end time for the task")

class ScheduleOutput(BaseModel):
    schedule: List[ScheduleItem] = Field(..., description="Chronological list of scheduled tasks")
    justification: str = Field(
        ..., 
        description="A friendly, 1-2 sentence explanation of how the AI balanced the workload, priorities, and breaks."
    )
