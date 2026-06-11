from ..schemas.schedule_schema import ScheduleGenerateRequest
from ..models.schedule import ScheduleOutput
from ..services.gemini_service import gemini_service
from ..prompts.schedule_generation import SCHEDULE_GENERATION_SYSTEM_PROMPT
from datetime import datetime

class ScheduleService:
    def generate_schedule(self, request: ScheduleGenerateRequest) -> ScheduleOutput:
        """
        Takes the incoming tasks and user preferences, passes them to Gemini,
        and returns a validated ScheduleOutput.
        """
        
        # 1. Format the request data into a clear JSON string for Gemini to read
        # Pydantic's model_dump_json() is perfect for this.
        request_json_str = request.model_dump_json()
        current_date = datetime.now().strftime("%Y-%m-%d")
        # 2. Build the user prompt
        user_prompt = (
            f"Please generate an optimized schedule based on the following data.\n\n"
            f"IMPORTANT: Today's date is {current_date}. Schedule the tasks for today.\n\n"
            f"User Data (Tasks and Work Preferences):\n"
            f"{request_json_str}"
        )
        
        # 3. Call the Gemini service
        # Gemini will return a fully validated ScheduleOutput Pydantic object!
        schedule_output = gemini_service.generate_structured_response(
            system_prompt=SCHEDULE_GENERATION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_schema=ScheduleOutput
        )
        
        return schedule_output

# Export a singleton instance
schedule_service = ScheduleService()