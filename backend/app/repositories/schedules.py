from datetime import date
from app.dependencies.supabase import get_supabase
from app.schemas.schedules import ScheduleOutput


class ScheduleRepository:
    def __init__(self) -> None:
        self.client = get_supabase()

    def latest(self, user_id: str) -> dict | None:
        data = self.client.table("schedules").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute().data
        return data[0] if data else None

    def replace_current(self, user_id: str, output: ScheduleOutput, source: str = "ai") -> dict:
        self.client.table("schedules").delete().eq("user_id", user_id).execute()
        return self.create(user_id, output, source)

    def create(self, user_id: str, output: ScheduleOutput, source: str = "ai") -> dict:
        payload = {
            "user_id": user_id,
            "schedule_date": date.today().isoformat(),
            "items": [item.model_dump(mode="json") for item in output.schedule],
            "unscheduled_items": [item.model_dump(mode="json") for item in output.unscheduled_tasks],
            "source": source,
        }
        return self.client.table("schedules").insert(payload).execute().data[0]

