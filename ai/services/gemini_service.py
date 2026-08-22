import os
from dotenv import load_dotenv
import json
from typing import Type, TypeVar, Optional
import google.generativeai as genai
from pydantic import BaseModel, ValidationError

# Create a generic type variable bound to Pydantic's BaseModel
T = TypeVar('T', bound=BaseModel)

load_dotenv() # <--- Add this line to load variables from .env
class GeminiService:
    def __init__(self):
        """
        Initializes the Gemini client. 
        Expects GEMINI_API_KEY to be set in the environment variables.
        """
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("CRITICAL: GEMINI_API_KEY environment variable is missing.")
        
        genai.configure(api_key=self.api_key)
        
        # gemini-1.5-flash is perfect for hackathons: very fast, cheap, and excellent at JSON formatting
        self.model_name = "gemini-2.5-flash"

    def generate_structured_response(
        self, 
        system_prompt: str, 
        user_prompt: str, 
        response_schema: Type[T]
    ) -> T:
        """
        Calls Gemini and forces the output to match the provided Pydantic schema.
        
        Args:
            system_prompt: The AI instructions (from ai/prompts/).
            user_prompt: The serialized data (Tasks, Preferences, or User Message).
            response_schema: The Pydantic model class to validate against.
            
        Returns:
            An instantiated Pydantic model containing the validated AI output.
        """
        # We use a specific GenerativeModel instance per call to inject the system instruction cleanly
        model = genai.GenerativeModel(
            model_name=self.model_name,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                # The GenAI SDK supports passing a JSON schema derived from Pydantic
                response_schema=response_schema 
            )
        )

        try:
            # Make the API call
            response = model.generate_content(user_prompt)
            
            # The response text is guaranteed to be a JSON string matching the schema
            json_text = response.text
            
            # Parse the JSON string directly into our Pydantic model
            validated_data = response_schema.model_validate_json(json_text)
            return validated_data

        except ValidationError as e:
            # This catches cases where Gemini hallucinates wrong types or missing fields
            # In a production app, we'd add retry logic here. For the MVP, we log/fail fast.
            print(f"Validation Error from Gemini Output: {e}")
            raise Exception("AI generated invalid data structure.") from e
            
        except Exception as e:
            print(f"Gemini API Error: {e}")
            raise Exception("Failed to communicate with Gemini API.") from e

# Instantiate a singleton to be imported and used by other services
gemini_service = GeminiService()