from app.core.config import get_settings
from app.services.ai.base import AIProvider
from app.services.ai.deepseek import DeepSeekProvider
from app.services.ai.gemini import GeminiProvider


def get_ai_provider() -> AIProvider:
    settings = get_settings()
    provider = settings.ai_provider.lower()
    if provider == "gemini":
        return GeminiProvider()
    return DeepSeekProvider()
