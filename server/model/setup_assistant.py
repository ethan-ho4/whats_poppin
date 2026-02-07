import asyncio
from dotenv import load_dotenv, set_key
import os
from backboard import BackboardClient

async def main():
    # Load environment variables
    load_dotenv()
    TOKEN = os.getenv("TOKEN")
    
    if not TOKEN:
        print("Error: TOKEN not found in .env file.")
        return
    
    print(f"Token loaded successfully: {TOKEN[:5]}...")
    
    # Initialize the Backboard client
    client = BackboardClient(api_key=TOKEN)

    # Create an assistant
    print("\nCreating assistant...")
    assistant = await client.create_assistant(
        name="News Assistant",
        system_prompt="You are a helpful assistant that provides concise and accurate answers."
    )
    
    print(f"✅ Assistant created successfully!")
    print(f"Assistant ID: {assistant.assistant_id}")
    
    # Save assistant ID to .env file (convert UUID to string)
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
    set_key(env_path, "ASSISTANT_ID", str(assistant.assistant_id))
    
    print(f"\n✅ Assistant ID saved to .env file")
    print("\nYou can now use chat.py to send messages!")

if __name__ == "__main__":
    asyncio.run(main())
