from pydantic import BaseModel, EmailStr, Field
from uuid import UUID


class User(BaseModel):
    id: UUID
    name: str = ""
    email: EmailStr


class AuthRequest(BaseModel):
    name: str | None = None
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)


class SignupResponse(BaseModel):
    message: str = "User registered successfully"


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    user: User


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user_id: str | None = None
    email: EmailStr | None = None

