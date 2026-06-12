from app.dependencies.supabase import get_supabase
from app.schemas.tasks import Priority, TaskCreate, TaskStatus, TaskUpdate


class TaskRepository:
    def __init__(self) -> None:
        self.client = get_supabase()

    def list(self, user_id: str, status: TaskStatus | None = None, priority: Priority | None = None) -> list[dict]:
        query = self.client.table("tasks").select("*").eq("user_id", user_id)
        if status:
            query = query.eq("status", status.value)
        if priority:
            query = query.eq("priority", priority.value)
        return query.execute().data or []

    def get(self, user_id: str, task_id: str) -> dict | None:
        data = self.client.table("tasks").select("*").eq("id", task_id).eq("user_id", user_id).limit(1).execute().data
        return data[0] if data else None

    def create(self, user_id: str, payload: TaskCreate) -> dict:
        data = payload.model_dump(mode="json")
        data["user_id"] = user_id
        return self.client.table("tasks").insert(data).execute().data[0]

    def update(self, user_id: str, task_id: str, payload: TaskUpdate) -> dict | None:
        data = payload.model_dump(mode="json", exclude_unset=True)
        result = self.client.table("tasks").update(data).eq("id", task_id).eq("user_id", user_id).execute().data
        return result[0] if result else None

    def delete(self, user_id: str, task_id: str) -> bool:
        data = self.client.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute().data
        return bool(data)

