from fastapi import HTTPException, status
from app.repositories.tasks import TaskRepository
from app.schemas.tasks import Priority, Task, TaskCreate, TaskSort, TaskStatus, TaskUpdate


PRIORITY_ORDER = {
    Priority.high: 0,
    Priority.medium: 1,
    Priority.low: 2,
}


class TaskService:
    def __init__(self, repo: TaskRepository | None = None) -> None:
        self.repo = repo or TaskRepository()

    def list_tasks(
        self,
        user_id: str,
        status_filter: TaskStatus | None = None,
        priority_filter: Priority | None = None,
        sort_by: TaskSort | None = None,
    ) -> list[Task]:
        tasks = [Task.model_validate(row) for row in self.repo.list(user_id, status_filter, priority_filter)]
        if sort_by == TaskSort.priority:
            return sorted(tasks, key=lambda task: (PRIORITY_ORDER[task.priority], task.deadline is None, task.deadline))
        return sorted(tasks, key=lambda task: (task.deadline is None, task.deadline))

    def get_task(self, user_id: str, task_id: str) -> Task:
        row = self.repo.get(user_id, task_id)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return Task.model_validate(row)

    def create_task(self, user_id: str, payload: TaskCreate) -> Task:
        return Task.model_validate(self.repo.create(user_id, payload))

    def update_task(self, user_id: str, task_id: str, payload: TaskUpdate) -> Task:
        if not payload.model_fields_set:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No task fields provided")
        current = self.repo.get(user_id, task_id)
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        Task.model_validate({**current, **payload.model_dump(mode="json", exclude_unset=True)})
        row = self.repo.update(user_id, task_id, payload)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        return Task.model_validate(row)

    def complete_task(self, user_id: str, task_id: str) -> Task:
        return self.update_task(user_id, task_id, TaskUpdate(status=TaskStatus.completed))

    def delete_task(self, user_id: str, task_id: str) -> None:
        if not self.repo.delete(user_id, task_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

