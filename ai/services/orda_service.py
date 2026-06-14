from pydantic import BaseModel
from ai.schemas.orda_schema import ORDARequest, OrdaResponse
from ai.services.gemini_service import gemini_service
from ai.prompts.intent_detection import INTENT_DETECTION_SYSTEM_PROMPT

class GeminiOrdaResponse(BaseModel):
    intent: str
    summary: str

class OrdaService:
    def process_chat(self, request: ORDARequest) -> OrdaResponse:
        request_json_str = request.model_dump_json()
        
        user_prompt = (
            f"Analyze the following user chat request and work preferences:\n\n"
            f"{request_json_str}\n\n"
            f"Output must strictly match the schema (intent and summary only)."
        )
        
        gemini_result = gemini_service.generate_structured_response(
            system_prompt=INTENT_DETECTION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_schema=GeminiOrdaResponse
        )
        
        final_response = OrdaResponse(
            intent=gemini_result.intent,
            summary=gemini_result.summary,
            schedule=None
        )
        
        return final_response

orda_service = OrdaService()