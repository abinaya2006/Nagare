from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api import tasks as tasks_api
from app.core.security import AuthUser
from app.dependencies.auth import get_current_user
from app.main import app
from app.schemas.tasks import Priority, Task, TaskStatus


client = TestClient(app)


def auth_override() -> AuthUser:
    return AuthUser(id=str(uuid4()), email="user@example.com")


def make_task() -> Task:
    now = datetime.now(timezone.utc)
    return Task(
        id=uuid4(),
        user_id=uuid4(),
        title="Finish Assignment",
        description="Complete DBMS assignment",
        deadline=now,
        estimated_duration_minutes=120,
        priority=Priority.high,
        status=TaskStatus.pending,
        created_at=now,
        updated_at=now,
    )


def test_list_tasks_returns_tasks_wrapper(monkeypatch) -> None:
    task = make_task()

    class Service:
        def list_tasks(self, user_id, status_filter=None, priority_filter=None, sort_by=None):
            assert status_filter == TaskStatus.pending
            assert priority_filter == Priority.high
            assert sort_by.value == "deadline"
            return [task]

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(tasks_api, "TaskService", Service)

    response = client.get("/api/v1/tasks?status=pending&priority=high&sort=deadline")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["tasks"][0]["title"] == "Finish Assignment"


def test_create_task_returns_message_and_task(monkeypatch) -> None:
    task = make_task()

    class Service:
        def create_task(self, user_id, payload):
            assert payload.priority == Priority.high
            return task

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(tasks_api, "TaskService", Service)

    response = client.post(
        "/api/v1/tasks",
        json={
            "title": "Finish Assignment",
            "description": "Complete DBMS assignment",
            "deadline": "2026-06-15T18:00:00",
            "estimated_duration_minutes": 120,
            "priority": "high",
        },
    )

    app.dependency_overrides.clear()
    assert response.status_code == 201
    assert response.json()["message"] == "Task created successfully"
    assert response.json()["task"]["priority"] == "high"


def test_get_task_returns_task_wrapper(monkeypatch) -> None:
    task = make_task()

    class Service:
        def get_task(self, user_id, task_id):
            return task

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(tasks_api, "TaskService", Service)

    response = client.get(f"/api/v1/tasks/{task.id}")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["task"]["id"] == str(task.id)


def test_complete_task_returns_message(monkeypatch) -> None:
    class Service:
        def complete_task(self, user_id, task_id):
            return make_task()

    app.dependency_overrides[get_current_user] = auth_override
    monkeypatch.setattr(tasks_api, "TaskService", Service)

    response = client.patch(f"/api/v1/tasks/{uuid4()}/complete")

    app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json() == {"message": "Task marked as completed"}


def test_tasks_require_authentication() -> None:
    response = client.get("/api/v1/tasks")

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing credentials"}
