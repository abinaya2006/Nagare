from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    environment: str = "development"
    api_host: str = "http://localhost:8000"
    frontend_origin: str = "http://localhost:3000"
    supabase_url: str = "http://localhost"
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = "dev-only-change-me"
    deepseek_api_key: str = ""
    deepseek_model: str = "deepseek-chat"
    rate_limit_per_minute: int = 60
    request_max_bytes: int = 1_000_000


@lru_cache
def get_settings() -> Settings:
    return Settings()
