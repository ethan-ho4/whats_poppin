
import pandas as pd
import os
import sys
import asyncio

# Ensure imports work
sys.path.append(os.path.dirname(__file__))
# Also append parent (server) to path to find model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase_client import SupabaseClient
try:
    from server.model.embed import embed_text
except ImportError:
    from model.embed import embed_text

def ingest_data(csv_path="news.csv", limit=50):
    """
    Ingest data from CSV into Supabase.
    """
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
    
    # Initialize Supabase Client
    try:
        supabase = SupabaseClient()
        print("Supabase client initialized.")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")
        return
    
    if limit:
        print(f"Processing last {limit} articles...")
        recent_articles = df.tail(limit).to_dict(orient="records")
    else:
        print(f"Processing all {len(df)} articles...")
        recent_articles = df.to_dict(orient="records")
    
    print(f"Found {len(recent_articles)} articles to process.")
    
    # Prepare articles for add_articles
    articles = []
    for row in recent_articles:
        articles.append({
            'title': row.get('title', ''),
            'url': row.get('url', ''),
            'date': row.get('date', ''),
            'themes': row.get('themes', ''),
            'location_names': row.get('location_names', '')
        })
        
    # Ingest using Helper
    try:
        supabase.add_articles(articles)
        print("Ingestion complete.")
    except Exception as e:
        print(f"Ingestion failed: {e}")

if __name__ == "__main__":
    import argparse
    from dotenv import load_dotenv
    
    # Load .env from root
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_dotenv(os.path.join(root_dir, ".env"))

    parser = argparse.ArgumentParser(description="Ingest news into Supabase.")
    parser.add_argument("--limit", type=int, default=50, help="Number of articles to ingest (latest first). 0 for all.")
    parser.add_argument("--file", type=str, default="news.csv", help="CSV file to ingest")
    
    args = parser.parse_args()
    limit = args.limit if args.limit > 0 else None
    
    ingest_data(csv_path=args.file, limit=limit)
