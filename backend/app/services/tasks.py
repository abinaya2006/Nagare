from app.repositories.tasks import TaskRepository
from app.schemas.tasks import Task, TaskCreate, TaskUpdate


class TaskService:
    def __init__(self, repo: TaskRepository | None = None) -> None:
        self.repo = repo or TaskRepository()

    def list_tasks(self, user_id: str) -> list[Task]:
        return [Task.model_validate(row) for row in self.repo.list(user_id)]

    def create_task(self, user_id: str, payload: TaskCreate) -> Task:
        return Task.model_validate(self.repo.create(user_id, payload))

    def update_task(self, user_id: str, task_id: str, payload: TaskUpdate) -> Task:
        return Task.model_validate(self.repo.update(user_id, task_id, payload))

    def delete_task(self, user_id: str, task_id: str) -> None:
        self.repo.delete(user_id, task_id)

