from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api import schedules as schedules_api
from app.core.security import AuthUser
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.schedules import ScheduleItem, ScheduleOutput


client = TestClient(app)


def auth_override() -> AuthUser:
    return AuthUser(id=str(uuid4()), email="user@example.com")


def test_get_current_schedule_returns_schedule_wrapper(monkeypatch) -> None:
    item = ScheduleItem(
        task_id=str(uuid4()),
        task_title="Task",
        start_time=datetime(2026, 6, 15, 18, tzinfo=timezone.utc),
        end_time=datetime(2026, 6, 15, 19, tzinfo=timezone.utc),
    )

    class Service:
        def get_current(self, user_id):
            return ScheduleOutput(schedule=[item])

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(schedules_api, "ScheduleService", Service)

    response = client.get("/api/v1/schedule")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["schedule"][0]["task_title"] == "Task"


def test_generate_accepts_public_draft_body(monkeypatch) -> None:
    item = ScheduleItem(
        task_id=str(uuid4()),
        task_title="Generated",
        start_time=datetime(2026, 6, 15, 18, tzinfo=timezone.utc),
        end_time=datetime(2026, 6, 15, 19, tzinfo=timezone.utc),
    )

    class Service:
        async def generate(self, user_id, payload):
            assert len(payload.available_hours) == 1
            assert payload.available_hours[0].start.hour == 18
            assert payload.productivity_preference == "evening"
            return ScheduleOutput(schedule=[item])

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(schedules_api, "ScheduleService", Service)

    response = client.post(
        "/api/v1/schedule/generate",
        json={
            "available_hours": [{"start": "18:00", "end": "22:00"}],
            "productivity_preference": "evening",
        },
    )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["schedule"][0]["task_title"] == "Generated"


def test_reschedule_returns_updated_schedule_wrapper(monkeypatch) -> None:
    item = ScheduleItem(
        task_id=str(uuid4()),
        task_title="Updated",
        start_time=datetime(2026, 6, 15, 18, tzinfo=timezone.utc),
        end_time=datetime(2026, 6, 15, 19, tzinfo=timezone.utc),
    )

    class Service:
        async def reschedule(self, user_id, payload):
            assert payload.reason == "Unexpected meeting"
            return ScheduleOutput(schedule=[item])

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(schedules_api, "ScheduleService", Service)

    response = client.post(
        "/api/v1/schedule/reschedule",
        json={
            "reason": "Unexpected meeting",
            "event": {
                "title": "Meeting",
                "start_time": "2026-06-14T16:00:00Z",
                "end_time": "2026-06-14T17:00:00Z",
            },
        },
    )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["updated_schedule"][0]["task_title"] == "Updated"


def test_schedule_endpoints_require_authentication() -> None:
    response = client.get("/api/v1/schedule")

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing credentials"}
