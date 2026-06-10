from app.dependencies.supabase import get_supabase
from app.schemas.tasks import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self) -> None:
        self.client = get_supabase()

    def list(self, user_id: str) -> list[dict]:
        return self.client.table("tasks").select("*").eq("user_id", user_id).order("deadline").execute().data

    def create(self, user_id: str, payload: TaskCreate) -> dict:
        data = payload.model_dump(mode="json")
        data["user_id"] = user_id
        return self.client.table("tasks").insert(data).execute().data[0]

    def update(self, user_id: str, task_id: str, payload: TaskUpdate) -> dict:
        data = payload.model_dump(mode="json", exclude_unset=True)
        return self.client.table("tasks").update(data).eq("id", task_id).eq("user_id", user_id).execute().data[0]

    def delete(self, user_id: str, task_id: str) -> None:
        self.client.table("tasks").delete().eq("id", task_id).eq("user_id", user_id).execute()

