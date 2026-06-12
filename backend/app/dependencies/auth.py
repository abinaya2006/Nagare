from fastapi import Depends, Request
from app.core.security import AuthUser, get_bearer_token, verify_supabase_jwt


def get_current_user(request: Request) -> AuthUser:
    return verify_supabase_jwt(get_bearer_token(request))


CurrentUser = Depends(get_current_user)