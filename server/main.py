from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from model.chat import get_chat_response

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

@app.get("/news")
def get_news(filter: str = None):
    news_items = [
        {"id": 1, "title": "Tech News: Python 4.0 Released?", "category": "Tech"},
        {"id": 2, "title": "Global: World Peace Achieved", "category": "World"},
        {"id": 3, "title": "Sports: Local Team Wins Again", "category": "Sports"}
    ]
    if filter:
        return [item for item in news_items if filter.lower() in item["category"].lower() or filter.lower() in item["title"].lower()]
    return news_items

from main_functions import handle_chat

# ... existing code ...

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
