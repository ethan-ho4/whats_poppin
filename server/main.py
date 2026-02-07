from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

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
