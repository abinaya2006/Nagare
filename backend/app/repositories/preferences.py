from __future__ import annotations

from app.dependencies.supabase import get_supabase
from app.schemas.preferences import RoutineTaskCreate, RoutineTaskUpdate, UserPreferencesUpsert


class UserPreferencesRepository:
    def __init__(self) -> None:
        self.client = get_supabase()

    def get(self, user_id: str) -> dict | None:
        data = self.client.table("user_preferences").select("*").eq("user_id", user_id).limit(1).execute().data
        return data[0] if data else None

    def upsert(self, user_id: str, payload: UserPreferencesUpsert) -> dict:
        data = payload.model_dump(mode="json", exclude={"routine_tasks"})
        data["user_id"] = user_id
        result = self.client.table("user_preferences").upsert(data, on_conflict="user_id").execute().data
        return result[0]


class RoutineTaskRepository:
    def __init__(self) -> None:
        self.client = get_supabase()

    def list(self, user_id: str, active_only: bool = False) -> list[dict]:
        query = self.client.table("routine_tasks").select("*").eq("user_id", user_id)
        if active_only:
            query = query.eq("is_active", True)
        return query.order("start_time").execute().data or []

    def get(self, user_id: str, routine_task_id: str) -> dict | None:
        data = self.client.table("routine_tasks").select("*").eq("id", routine_task_id).eq("user_id", user_id).limit(1).execute().data
        return data[0] if data else None

    def create(self, user_id: str, payload: RoutineTaskCreate) -> dict:
        data = self._routine_payload(payload.model_dump(mode="json"))
        data["user_id"] = user_id
        return self.client.table("routine_tasks").insert(data).execute().data[0]

    def replace_for_user(self, user_id: str, payloads: list[RoutineTaskCreate]) -> list[dict]:
        self.client.table("routine_tasks").delete().eq("user_id", user_id).execute()
        if not payloads:
            return []
        rows = []
        for payload in payloads:
            row = self._routine_payload(payload.model_dump(mode="json"))
            row["user_id"] = user_id
            rows.append(row)
        return self.client.table("routine_tasks").insert(rows).execute().data or []

    def update(self, user_id: str, routine_task_id: str, payload: RoutineTaskUpdate) -> dict | None:
        data = self._routine_payload(payload.model_dump(mode="json", exclude_unset=True))
        result = self.client.table("routine_tasks").update(data).eq("id", routine_task_id).eq("user_id", user_id).execute().data
        return result[0] if result else None

    def delete(self, user_id: str, routine_task_id: str) -> bool:
        data = self.client.table("routine_tasks").delete().eq("id", routine_task_id).eq("user_id", user_id).execute().data
        return bool(data)

    def _routine_payload(self, data: dict) -> dict:
     if "days" in data and not isinstance(data["days"], list):
        data["days"] = [data["days"]]
     return data
