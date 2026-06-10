from fastapi import APIRouter, Response
from app.dependencies.supabase import get_supabase
from app.core.config import get_settings
from app.schemas.auth import AuthRequest, AuthResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: AuthRequest, response: Response) -> AuthResponse:
    auth = get_supabase().auth.sign_up({"email": payload.email, "password": payload.password})
    session = auth.session
    if session:
        response.set_cookie("pulse_access_token", session.access_token, httponly=True, secure=get_settings().environment != "development", samesite="lax")
    return AuthResponse(
        access_token=session.access_token if session else "",
        refresh_token=session.refresh_token if session else None,
        user_id=auth.user.id if auth.user else None,
        email=payload.email,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: AuthRequest, response: Response) -> AuthResponse:
    auth = get_supabase().auth.sign_in_with_password({"email": payload.email, "password": payload.password})
    session = auth.session
    response.set_cookie("pulse_access_token", session.access_token, httponly=True, secure=get_settings().environment != "development", samesite="lax")
    return AuthResponse(access_token=session.access_token, refresh_token=session.refresh_token, user_id=auth.user.id, email=payload.email)


@router.post("/logout")
def logout(response: Response) -> dict[str, str]:
    response.delete_cookie("pulse_access_token")
    return {"message": "Logged out"}
