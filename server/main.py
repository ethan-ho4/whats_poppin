from fastapi import FastAPI
import uvicorn

import pandas as pd
import os

app = FastAPI()

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
