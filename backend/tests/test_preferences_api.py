from datetime import datetime, time, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api import preferences as preferences_api
from app.core.security import AuthUser
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.preferences import PreferencesMutationResponse, RoutineTask, UserPreferences


client = TestClient(app)


def auth_override() -> AuthUser:
    return AuthUser(id=str(uuid4()), email="user@example.com")


def make_preferences() -> UserPreferences:
    now = datetime.now(timezone.utc)
    return UserPreferences(
        id=uuid4(),
        user_id=uuid4(),
        productivity_period="evening",
        work_style="balanced",
        focus_duration_minutes=45,
        break_preference="Every 45 minutes",
        sleep_hours="7-8 hours",
        task_count=5,
        created_at=now,
        updated_at=now,
    )


def make_routine_task() -> RoutineTask:
    return RoutineTask(
        id=uuid4(),
        user_id=uuid4(),
        title="Class",
        start_time=time(9, 0),
        end_time=time(10, 0),
        days="monday,wednesday",
        is_active=True,
        created_at=datetime.now(timezone.utc),
    )


def test_preferences_require_authentication() -> None:
    response = client.get("/api/v1/preferences/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing credentials"}


def test_upsert_preferences_accepts_questionnaire_and_routine_tasks(monkeypatch) -> None:
    preferences = make_preferences()
    routine_task = make_routine_task()

    class Service:
        def upsert_questionnaire(self, user_id, payload):
            assert payload.productivity_period == "evening"
            assert payload.focus_duration_minutes == 45
            assert payload.task_count == 5
            assert payload.routine_tasks[0].title == "Class"
            return PreferencesMutationResponse(
                message="Preferences saved successfully",
                preferences=preferences,
                routine_tasks=[routine_task],
            )

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(preferences_api, "PreferencesService", Service)

    response = client.put(
        "/api/v1/preferences/me",
        json={
            "productivity_period": "evening",
            "work_style": "balanced",
            "focus_duration_minutes": 45,
            "break_preference": "Every 45 minutes",
            "sleep_hours": "7-8 hours",
            "task_count": 5,
            "routine_tasks": [
                {
                    "title": "Class",
                    "start_time": "09:00",
                    "end_time": "10:00",
                    "days": ["monday", "wednesday"],
                }
            ],
        },
    )

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["preferences"]["productivity_period"] == "evening"
    assert response.json()["preferences"]["task_count"] == 5
    assert response.json()["routine_tasks"][0]["title"] == "Class"


def test_create_routine_task_returns_wrapper(monkeypatch) -> None:
    routine_task = make_routine_task()

    class Service:
        def create_routine_task(self, user_id, payload):
            assert payload.title == "Class"
            return routine_task

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(preferences_api, "PreferencesService", Service)

    response = client.post(
        "/api/v1/routine-tasks",
        json={"title": "Class", "start_time": "09:00", "end_time": "10:00", "days": ["daily"]},
    )

    app.dependency_overrides.clear()
    assert response.status_code == 201
    assert response.json()["message"] == "Routine task created successfully"
