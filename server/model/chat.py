from dotenv import load_dotenv
import os
from openai import AsyncOpenAI

async def get_chat_response(user_input: str) -> str:
    """
    Send a message to the AI assistant and get a response.
    
    Args:
        user_input (str): The user's question.
        
    Returns:
        str: The assistant's response.
    """
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return "Error: OPENAI_API_KEY not found in .env file."

    try:
        # Use context manager to handle client lifecycle properly
        async with AsyncOpenAI(api_key=api_key) as client:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": user_input}
                ]
            )
            return response.choices[0].message.content
            
    except Exception as e:
        return f"Error communicating with AI: {e}"
