from fastapi.testclient import TestClient

from app.api import auth as auth_api
from app.main import app


client = TestClient(app)


def test_login_with_invalid_credentials_returns_401(monkeypatch) -> None:
    class AuthClient:
        def sign_in_with_password(self, credentials):
            raise Exception("raw provider error")

    class SupabaseClient:
        auth = AuthClient()

    monkeypatch.setattr(auth_api, "get_supabase", lambda: SupabaseClient())

    response = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "password123"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password"}


def test_auth_body_validation_returns_standard_error() -> None:
    response = client.post("/api/v1/auth/login", json={"email": "not-an-email", "password": "short"})

    assert response.status_code == 422
    assert response.json()["detail"] == "Invalid request"
    assert response.json()["errors"]


def test_current_user_requires_credentials() -> None:
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing credentials"}


def test_logout_requires_credentials() -> None:
    response = client.post("/api/v1/auth/logout")

    assert response.status_code == 401
    assert response.json() == {"detail": "Missing credentials"}
