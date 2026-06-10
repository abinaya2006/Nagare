from app.services.ai.base import AIProvider
from app.services.ai.deepseek import DeepSeekProvider


def get_ai_provider() -> AIProvider:
    return DeepSeekProvider()

