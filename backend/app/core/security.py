from datetime import datetime, timezone
from fastapi import HTTPException, Request, status
from jose import JWTError, jwt
from pydantic import BaseModel
from app.core.config import get_settings


class AuthUser(BaseModel):
    id: str
    email: str | None = None


def sanitize_text(value: str | None, max_len: int = 2000) -> str:
    if not value:
        return ""
    return value.replace("\x00", "").strip()[:max_len]


def verify_supabase_jwt(token: str) -> AuthUser:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_aud": False},
        )
    except JWTError as exc:
        try:
            from app.dependencies.supabase import get_supabase

            response = get_supabase().auth.get_user(token)
            user = response.user if response else None
            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
            return AuthUser(id=user.id, email=user.email)
        except HTTPException:
            raise
        except Exception as supabase_exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from supabase_exc

    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp, timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing subject")
    return AuthUser(id=user_id, email=payload.get("email"))


def get_bearer_token(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    if authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip()
    cookie_token = request.cookies.get("pulse_access_token")
    if cookie_token:
        return cookie_token
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")

