from fastapi import APIRouter, Query, status as http_status
from app.dependencies.auth import CurrentUser
from app.schemas.tasks import (
    Priority,
    TaskListResponse,
    TaskMessageResponse,
    TaskMutationResponse,
    TaskResponse,
    TaskSort,
    TaskStatus,
    TaskCreate,
    TaskUpdate,
)
from app.services.tasks import TaskService

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.get("", response_model=TaskListResponse)
def list_tasks(
    status: TaskStatus | None = Query(default=None),
    priority: Priority | None = Query(default=None),
    sort: TaskSort | None = Query(default=TaskSort.deadline),
    user=CurrentUser,
) -> TaskListResponse:
    tasks = TaskService().list_tasks(user.id, status_filter=status, priority_filter=priority, sort_by=sort)
    return TaskListResponse(tasks=tasks)


@router.post("", response_model=TaskMutationResponse, status_code=http_status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, user=CurrentUser) -> TaskMutationResponse:
    task = TaskService().create_task(user.id, payload)
    return TaskMutationResponse(message="Task created successfully", task=task)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: str, user=CurrentUser) -> TaskResponse:
    task = TaskService().get_task(user.id, task_id)
    return TaskResponse(task=task)


@router.put("/{task_id}", response_model=TaskMessageResponse)
def update_task(task_id: str, payload: TaskUpdate, user=CurrentUser) -> TaskMessageResponse:
    TaskService().update_task(user.id, task_id, payload)
    return TaskMessageResponse(message="Task updated successfully")


@router.patch("/{task_id}/complete", response_model=TaskMessageResponse)
def complete_task(task_id: str, user=CurrentUser) -> TaskMessageResponse:
    TaskService().complete_task(user.id, task_id)
    return TaskMessageResponse(message="Task marked as completed")


@router.delete("/{task_id}", response_model=TaskMessageResponse)
def delete_task(task_id: str, user=CurrentUser) -> TaskMessageResponse:
    TaskService().delete_task(user.id, task_id)
    return TaskMessageResponse(message="Task deleted successfully")

