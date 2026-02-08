
import pandas as pd
import os
import sys

# Ensure imports work
sys.path.append(os.path.dirname(__file__))

from vector_db import VectorDB

def ingest_data(csv_path="news.csv", limit=50):
    """
    Ingest data from CSV into ChromaDB.
    """
    # ingest.py is in server/db_handle/
    # root is 3 levels up: server/db_handle/ -> server/ -> root
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_path = os.path.join(base_dir, csv_path)
    
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        return

    print(f"Reading {full_path}...")
    try:
        df = pd.read_csv(full_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return
        
    print(f"Found {len(df)} rows.")
    
    # Initialize DB
    db = VectorDB()
    
    # Check existing IDs to avoid duplicates (naive check for now)
    # Chroma upsert handles updates, but we want to avoid re-embedding if possible
    # For simplicity in this script, we'll just process the last N articles
    
    if limit:
        print(f"Processing last {limit} articles...")
        recent_articles = df.tail(limit).to_dict(orient="records")
    else:
        print(f"Processing all {len(df)} articles...")
        recent_articles = df.to_dict(orient="records")
    
    print(f"Found {len(recent_articles)} articles to process.")
    
    batch = []
    for row in recent_articles:
        # Standardize keys for vector_db.py
        article = {
            'title': row.get('title', ''),
            'url': row.get('url', ''),
            'date': row.get('date', ''),
            'themes': row.get('themes', ''),
            'location_names': row.get('location_names', '')
        }
        batch.append(article)
        
    # Ingest
    if batch:
        db.add_articles(batch)
        print("Ingestion complete.")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Ingest news into vector DB.")
    parser.add_argument("--limit", type=int, default=50, help="Number of articles to ingest (latest first). 0 for all.")
    parser.add_argument("--file", type=str, default="news.csv", help="CSV file to ingest")
    
    args = parser.parse_args()
    
    # If limit is 0, pass None or a very large number? 
    # Let's handle 0 as 'all' by reading the whole file.
    limit = args.limit if args.limit > 0 else None
    
    ingest_data(csv_path=args.file, limit=limit)
