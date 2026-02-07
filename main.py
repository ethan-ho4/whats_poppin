
import argparse
import pandas as pd
from gdelt_client import GDELTClient

def fetch_and_translate_global_news(limit: int = 100, custom_query: str = None):
    """
    Fetches news from the last hour and translates them to English.
    If no custom_query is provided, fetches ALL news (tone>-100).
    """
    client = GDELTClient()
    timespan = "1 hour"
    
    # Use provided query or default to "global" catch-all
    query = custom_query if custom_query else "tone>-100"
    query_display = custom_query if custom_query else "All Topics (Global)"
    
    print(f"Starting News Pipeline...")
    print(f"- Time Window: Last {timespan}")
    print(f"- Query: {query_display}")
    print(f"- Translation: ENABLED")
    print(f"- Max Records: {limit}")
    
    try:
        # Fetch data with translation enabled
        df = client.search(
            query=query, 
            timespan=timespan, 
            max_records=limit, 
            translate=True
        )
        
        if not df.empty:
            print(f"\nSuccess! Retrieved {len(df)} articles.")
            
            # Select relevant columns primarily
            cols = ['seendate', 'title', 'url', 'sourcecountry', 'language']
            available_cols = [c for c in cols if c in df.columns]
            
            # Use all available cols if specific ones aren't found, but maintain order if they are
            final_cols = available_cols if available_cols else df.columns
            
            # Save to CSV
            output_file = "news_results_translated.csv"
            df[final_cols].to_csv(output_file, index=False, encoding='utf-8')
            print(f"\nFull results saved to: {output_file}")
            
        else:
            print("No articles found.")
            
    except Exception as e:
        print(f"Pipeline Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch and translate news pipeline.")
    parser.add_argument("--limit", type=int, default=100, help="Number of articles (default: 100)")
    parser.add_argument("--query", type=str, help="Specific topic/query (e.g. 'bitcoin', 'france'). Defaults to ALL global news.")
    
    args = parser.parse_args()
    
    fetch_and_translate_global_news(limit=args.limit, custom_query=args.query)
