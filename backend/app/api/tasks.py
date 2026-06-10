from fastapi import APIRouter, status
from app.dependencies.auth import CurrentUser
from app.schemas.tasks import Task, TaskCreate, TaskUpdate
from app.services.tasks import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[Task])
def list_tasks(user=CurrentUser) -> list[Task]:
    return TaskService().list_tasks(user.id)


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, user=CurrentUser) -> Task:
    return TaskService().create_task(user.id, payload)


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, payload: TaskUpdate, user=CurrentUser) -> Task:
    return TaskService().update_task(user.id, task_id, payload)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str, user=CurrentUser) -> None:
    TaskService().delete_task(user.id, task_id)

