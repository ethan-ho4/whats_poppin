from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

import pandas as pd
import os

app = FastAPI()

# Allow CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import Response
import json

# Get the directory of the current script to locate the CSV. 
# Identifying the parent directory where live_news.csv is located (one level up from server/)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "live_news.csv")

@app.get("/")
def read_root():
    if os.path.exists(CSV_PATH):
        try:
            df = pd.read_csv(CSV_PATH)
            # Convert NaN to None for valid JSON
            df = df.where(pd.notnull(df), None)
            data = df.to_dict(orient="records")
            return Response(content=json.dumps(data, indent=4), media_type="application/json")
        except Exception as e:
            return {"error": str(e)}
    return {"error": "File not found"}


from server.db_handle.search_articles import search_articles
from server.fuzzy_search import fuzzy_search

@app.get("/news")
def get_news(query: str = None, count: int = 1000, threshold: float = 0.25, enable_fuzzy: bool = True):
    """
    Get news articles. 
    If query is provided, performs a vector search (optionally with fuzzy correction).
    Otherwise returns a default list.
    """
    if query:
        print(f"Searching for: {query}")
        
        search_query = query
        if enable_fuzzy:
            try:
                corrected = fuzzy_search(query)
                if corrected != query:
                    print(f"Fuzzy corrected: {corrected}")
                    search_query = corrected
            except Exception as e:
                print(f"Fuzzy search error: {e}")

        try:
            results = search_articles(search_query, match_threshold=threshold, match_count=count)
            
            # Print the results as JSON to the console
            print(f"\n--- Search Results ({len(results)} found) ---")
            print(json.dumps(results[:5], indent=2))  # Print first 5 items to avoid huge logs
            if len(results) > 5:
                print(f"... and {len(results) - 5} more.")
            print("------------------------------------------\n")

            return results 
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"Error during search: {e}")
            return {"error": str(e), "traceback": tb}
            
    # Default behavior: Return empty list if no query provided
    return []

from server.main_functions import handle_chat

@app.get("/chat")
async def chat(query: str):
    """
    ENDPOINT: Recieves the user's message from the Frontend.
    """
    if not query:
        print("Received empty query.")
        return {"error": "Query is empty"}
    
    # 1. Print what we recieved for debugging
    print(f"\n--- Received Query: {query} ---")
    
    # 2. Call the logic function in main_functions.py
    # This keeps the API code clean and separates the logic
    response = await handle_chat(query)
    
    # 3. Print the response we got back
    print(f"--- Sending Response: {response} ---\n")
    
    # 4. Send the result back to the frontend
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
