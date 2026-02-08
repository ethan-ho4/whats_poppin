import json
import sys
import os

# Add project root to sys.path to ensure imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

from server.db_handle.search_articles import search_articles

async def handle_chat(query: str) -> str:
    """
    Simulate chat response by retrieving relevant articles.
    
    Args:
        query (str): The user's query.
        
    Returns:
        str: JSON string containing list of relevant articles.
    """
    try:
        # Search for articles similar to the query
        # Using defaults: threshold=0.3, count=5
        results = search_articles(query, match_threshold=0.3, match_count=5)
        
        # If no results, maybe return a message? 
        # But for now, just return empty list json or the results
        return json.dumps(results, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    import asyncio
    # Test the function directly
    async def test():
        response = await handle_chat("What is happening in technology?")
        print(response)
        
    asyncio.run(test())
