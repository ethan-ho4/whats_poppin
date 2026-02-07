import asyncio
from dotenv import load_dotenv
import os
from backboard import BackboardClient

async def send_message(prompt: str):
    """Send a message to the assistant and get a response"""
    # Load environment variables
    load_dotenv()
    TOKEN = os.getenv("TOKEN")
    ASSISTANT_ID = os.getenv("ASSISTANT_ID")
    
    if not TOKEN:
        print("Error: TOKEN not found in .env file.")
        return None
    
    if not ASSISTANT_ID:
        print("Error: ASSISTANT_ID not found in .env file.")
        print("Please run setup_assistant.py first to create an assistant.")
        return None
    
    # Initialize the Backboard client
    client = BackboardClient(api_key=TOKEN)

    # Create a new thread for this conversation
    thread = await client.create_thread(ASSISTANT_ID)

    # Send the message and get the response
    response = await client.add_message(
        thread_id=thread.thread_id,
        content=prompt,
        llm_provider="anthropic",
        model_name="claude-3-7-sonnet-20250219",
        stream=False
    )

    return response.content

async def main():
    # Set your question here
    question = "what is the capital of france"
    
    print(f"Question: {question}")
    print("\nSending message...")
    response = await send_message(question)
    
    if response:
        print("\nResponse:")
        print(response)

if __name__ == "__main__":
    asyncio.run(main())
