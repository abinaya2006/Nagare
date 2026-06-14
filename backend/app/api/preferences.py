from fastapi import APIRouter, Query, status
from app.dependencies.auth import CurrentUser
from app.schemas.preferences import (
    PreferencesMutationResponse,
    PreferencesResponse,
    RoutineTaskCreate,
    RoutineTaskListResponse,
    RoutineTaskMessageResponse,
    RoutineTaskResponse,
    RoutineTaskUpdate,
    UserPreferencesUpsert,
)
from app.services.preferences import PreferencesService

router = APIRouter(prefix="/api/v1", tags=["preferences"])


@router.get("/preferences/me", response_model=PreferencesResponse)
def get_preferences(user=CurrentUser) -> PreferencesResponse:
    return PreferencesService().get_profile_preferences(user.id)


@router.put("/preferences/me", response_model=PreferencesMutationResponse)
def upsert_preferences(payload: UserPreferencesUpsert, user=CurrentUser) -> PreferencesMutationResponse:
    return PreferencesService().upsert_questionnaire(user.id, payload)


@router.get("/routine-tasks", response_model=RoutineTaskListResponse)
def list_routine_tasks(active_only: bool = Query(default=False), user=CurrentUser) -> RoutineTaskListResponse:
    routine_tasks = PreferencesService().list_routine_tasks(user.id, active_only=active_only)
    return RoutineTaskListResponse(routine_tasks=routine_tasks)


@router.post("/routine-tasks", response_model=RoutineTaskResponse, status_code=status.HTTP_201_CREATED)
def create_routine_task(payload: RoutineTaskCreate, user=CurrentUser) -> RoutineTaskResponse:
    routine_task = PreferencesService().create_routine_task(user.id, payload)
    return RoutineTaskResponse(message="Routine task created successfully", routine_task=routine_task)


@router.put("/routine-tasks/{routine_task_id}", response_model=RoutineTaskResponse)
def update_routine_task(routine_task_id: str, payload: RoutineTaskUpdate, user=CurrentUser) -> RoutineTaskResponse:
    routine_task = PreferencesService().update_routine_task(user.id, routine_task_id, payload)
    return RoutineTaskResponse(message="Routine task updated successfully", routine_task=routine_task)


@router.delete("/routine-tasks/{routine_task_id}", response_model=RoutineTaskMessageResponse)
def delete_routine_task(routine_task_id: str, user=CurrentUser) -> RoutineTaskMessageResponse:
    PreferencesService().delete_routine_task(user.id, routine_task_id)
    return RoutineTaskMessageResponse(message="Routine task deleted successfully")
