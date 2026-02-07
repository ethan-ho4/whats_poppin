import sys
import os
import asyncio
from embed import embed_text
from chat import get_chat_response

# Ensure we can import modules from current directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

def test_embedding_simple():
    print("--- 1. Testing Embedding (embed.py) ---")
    text = "Simple test."
    print(f"Input: '{text}'")
    vector = embed_text(text)
    
    if vector is not None:
        print(f"✅ Embed Success. Vector shape: {vector.shape}")
    else:
        print("❌ Embed Failed")
    print("-" * 30)

async def test_chat_simple():
    print("\n--- 2. Testing Chat (chat.py) ---")
    query = "What is AI?"
    print(f"Input: '{query}'")
    
    response = await get_chat_response(query)
    
    if response and "Error" not in response:
        print(f"\n✅ Chat Success. Response:\n{response[:100]}...")
    else:
        print(f"❌ Chat Failed: {response}")
    print("-" * 30)

if __name__ == "__main__":
    test_embedding_simple()
    asyncio.run(test_chat_simple())
