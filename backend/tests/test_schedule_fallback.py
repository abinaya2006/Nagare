from datetime import datetime
from uuid import uuid4
import pytest
from app.schemas.schedules import WorkPreferences
from app.schemas.tasks import Task
from app.services.ai.deepseek import DeepSeekProvider


@pytest.mark.asyncio
async def test_fallback_schedule_orders_tasks() -> None:
    provider = DeepSeekProvider()
    tasks = [
        Task(id=uuid4(), user_id=uuid4(), title="Low thing", description="", deadline=None, estimated_duration_minutes=30, priority="Low", status="Pending", created_at=datetime.now(), updated_at=datetime.now()),
        Task(id=uuid4(), user_id=uuid4(), title="Important", description="", deadline=None, estimated_duration_minutes=30, priority="High", status="Pending", created_at=datetime.now(), updated_at=datetime.now()),
    ]
    output = provider._fallback(tasks)
    assert output.schedule[0].task_title == "Important"

