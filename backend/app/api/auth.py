from app.core.config import get_settings
from app.core.security import AuthUser
from app.dependencies.auth import get_current_user
from app.dependencies.supabase import get_supabase
from app.schemas.auth import AuthRequest, LoginResponse, SignupResponse, User
from fastapi import APIRouter, Depends, HTTPException, Response, Security, status
from fastapi.security import HTTPBearer

security = HTTPBearer(scheme_name="Bearer", auto_error=False)
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post(
    "/signup", response_model=SignupResponse, status_code=status.HTTP_201_CREATED
)
def signup(payload: AuthRequest, response: Response) -> SignupResponse:
    try:
        auth = get_supabase().auth.sign_up(
            {"email": payload.email, "password": payload.password}
        )
        session = auth.session

        if session and auth.user:
            response.set_cookie(
                "pulse_access_token",
                session.access_token,
                httponly=True,
                secure=True,
                samesite="none",
            )

        return SignupResponse()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to create account"
        ) from exc


@router.post("/login", response_model=LoginResponse)
def login(payload: AuthRequest, response: Response) -> LoginResponse:
    try:
        auth = get_supabase().auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
        session = auth.session
        if not session or not auth.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        response.set_cookie(
            "pulse_access_token",
            session.access_token,
            httponly=True,
            secure=get_settings().environment != "development",
            samesite="lax",
        )

        return LoginResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user=User(
                id=auth.user.id, name=payload.name or "", email=auth.user.email or ""
            ),
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        ) from exc


@router.get("/me", response_model=User)
def get_current_user_profile(
    _credentials=Security(security),
    current_user: AuthUser = Depends(get_current_user),
) -> User:
    return User(id=current_user.id, name="", email=current_user.email or "")


@router.post("/logout")
def logout(
    response: Response, current_user: AuthUser = Depends(get_current_user)
) -> dict[str, str]:
    response.delete_cookie("pulse_access_token")
    return {"message": "Logged out successfully"}
