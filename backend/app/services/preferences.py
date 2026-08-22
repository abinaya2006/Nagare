from fastapi import HTTPException, status
from app.repositories.preferences import RoutineTaskRepository, UserPreferencesRepository
from app.schemas.preferences import (
    PreferencesMutationResponse,
    PreferencesResponse,
    RoutineTask,
    RoutineTaskCreate,
    RoutineTaskUpdate,
    UserPreferences,
    UserPreferencesUpsert,
)


class PreferencesService:
    def __init__(
        self,
        preferences_repo: UserPreferencesRepository | None = None,
        routine_repo: RoutineTaskRepository | None = None,
    ) -> None:
        self.preferences_repo = preferences_repo or UserPreferencesRepository()
        self.routine_repo = routine_repo or RoutineTaskRepository()

    def get_profile_preferences(self, user_id: str) -> PreferencesResponse:
        preferences = self.preferences_repo.get(user_id)
        routine_tasks = self.routine_repo.list(user_id)
        return PreferencesResponse(
            preferences=UserPreferences.model_validate(preferences) if preferences else None,
            routine_tasks=[RoutineTask.model_validate(row) for row in routine_tasks],
        )

    def get_user_preferences(self, user_id: str) -> UserPreferences | None:
        preferences = self.preferences_repo.get(user_id)
        return UserPreferences.model_validate(preferences) if preferences else None

    def upsert_questionnaire(self, user_id: str, payload: UserPreferencesUpsert) -> PreferencesMutationResponse:
        preferences = UserPreferences.model_validate(self.preferences_repo.upsert(user_id, payload))
        if "routine_tasks" in payload.model_fields_set:
            routine_rows = self.routine_repo.replace_for_user(user_id, payload.routine_tasks)
        else:
            routine_rows = self.routine_repo.list(user_id)
        return PreferencesMutationResponse(
            message="Preferences saved successfully",
            preferences=preferences,
            routine_tasks=[RoutineTask.model_validate(row) for row in routine_rows],
        )

    def list_routine_tasks(self, user_id: str, active_only: bool = False) -> list[RoutineTask]:
        return [RoutineTask.model_validate(row) for row in self.routine_repo.list(user_id, active_only=active_only)]

    def create_routine_task(self, user_id: str, payload: RoutineTaskCreate) -> RoutineTask:
        return RoutineTask.model_validate(self.routine_repo.create(user_id, payload))

    def update_routine_task(self, user_id: str, routine_task_id: str, payload: RoutineTaskUpdate) -> RoutineTask:
        if not payload.model_fields_set:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No routine task fields provided")
        current = self.routine_repo.get(user_id, routine_task_id)
        if not current:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine task not found")
        merged = {**current, **payload.model_dump(mode="json", exclude_unset=True)}
        RoutineTask.model_validate(merged)
        row = self.routine_repo.update(user_id, routine_task_id, payload)
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine task not found")
        return RoutineTask.model_validate(row)

    def delete_routine_task(self, user_id: str, routine_task_id: str) -> None:
        if not self.routine_repo.delete(user_id, routine_task_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine task not found")
