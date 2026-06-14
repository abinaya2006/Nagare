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
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M")
        # 2. Build the user prompt
        user_prompt = (
            f"Please generate an optimized schedule.\n"
            f"IMPORTANT RULES:\n"
            f"1. The current date and exact time right now is {current_datetime}.\n"
            f"2. You MUST NOT schedule any task to start before {current_datetime}. Start scheduling from now.\n"
            f"3. If a task's deadline is mathematically impossible to meet from the current time, just schedule it as soon as possible.\n"
            f"4. If a task's estimated duration is longer than the remaining time in the day, you are allowed to SPLIT the task. Output the same task_id twice in the schedule array (e.g., Part 1 today until workday_end, and Part 2 tomorrow at workday_start) until the full duration is met.\n"
            f"5. Add a 10-minute buffer (empty time) between tasks. Do not add the 10-minute buffer if the preceding or succeeding task is a routine break (e.g., Lunch, Tea break, Dinner, etc.).\n\n"
            f"User Data:\n{request_json_str}"
        )
        
        schedule_output = gemini_service.generate_structured_response(
            system_prompt=SCHEDULE_GENERATION_SYSTEM_PROMPT,
            user_prompt=user_prompt,
            response_schema=ScheduleOutput
        )
        
        return schedule_output

schedule_service = ScheduleService()