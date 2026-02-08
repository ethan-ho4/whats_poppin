
def search_articles(query: str, match_threshold=0.3, match_count=1000):
    """
    Searches for articles matching the query.
    
    Args:
        query (str): The search query.
        match_threshold (float): Minimum similarity threshold.
        match_count (int): Maximum number of results.
        
    Returns:
        List[dict]: List of articles with title, url, country, etc.
    """
import os
import sys
from dotenv import load_dotenv

# 1. Calculate paths (on import)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))

# 2. Add project root to sys.path
if project_root not in sys.path:
    sys.path.append(project_root)

# 3. Load env vars
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# 4. Import dependencies
from server.db_handle.supabase_client import SupabaseClient
try:
    from server.model.embed import embed_text
except ImportError:
    # Try alternate structure if needed
    try:
        from model.embed import embed_text
    except ImportError:
        # Fallback to local import if sys.path fails for some reason
        sys.path.append(os.path.dirname(current_dir))
        from model.embed import embed_text

def search_articles(query: str, match_threshold: float, match_count: int):
    """
    Searches for articles matching the query.
    
    Args:
        query (str): The search query.
        match_threshold (float): Minimum similarity threshold.
        match_count (int): Maximum number of results.
        
    Returns:
        List[dict]: List of articles with title, url, country, etc.
    """
    try:
        # 5. Generate Embedding
        embedding = embed_text(query)
    except Exception as e:
        print(f"Error generating embedding: {e}")
        import traceback
        traceback.print_exc()
        raise e

    
    if embedding is None:
        print("Failed to generate embedding.")
        return []

    # Convert to list for Supabase
    embedding_list = embedding.tolist()
    # Handle case where embed_text returns a single vector inside a list (1, 384)
    if isinstance(embedding_list[0], list):
        embedding_list = embedding_list[0]
        
    # 6. Search Supabase
    # print("Searching Supabase...")
    client = SupabaseClient()
    results = client.search_similar(embedding_list, match_threshold, match_count)
    
    if not results:
        return []
        
    # 7. Fetch full article details (specifically location_names) in one batch
    article_ids = [r['id'] for r in results]
    
    location_map = {}
    try:
        if article_ids:
            # We fetch all IDs at once which is much faster than serial chunks
            try:
                details_response = client.supabase.table("articles") \
                    .select("id, location_names") \
                    .in_("id", article_ids) \
                    .execute()
                # Update lookup map
                for item in details_response.data:
                    location_map[item['id']] = item.get('location_names', '')
            except Exception as ex:
                print(f"Error fetching article batch details: {ex}")

    except Exception as e:
        print(f"Error fetching article details: {e}")

    # 8. Format results
    final_results = []
    for row in results:
        country = location_map.get(str(row['id']), '')
        final_results.append({
            "id": row.get('id'),
            "title": row.get('title', 'Unknown Title'),
            "url": row.get('url', ''),
            "date": row.get('date', ''),
            "country": country,
            "similarity": row.get('similarity', 0)
        })
        
    return final_results

def save_results_to_csv(results, output_csv="search_results.csv"):
    """
    Saves the search results to a CSV file.
    
    Args:
        results (List[dict]): List of article dictionaries.
        output_csv (str): Path to save the CSV results.
    """
    import csv
    import os
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    
    try:
        # If output_csv is relative, make it relative to project root for visibility
        if not os.path.isabs(output_csv):
            output_csv_path = os.path.join(project_root, output_csv)
        else:
            output_csv_path = output_csv
            
        with open(output_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Title', 'Link', 'Country', 'Date', 'Similarity']) # Header
            for row in results:
                writer.writerow([
                    row.get('title', 'Unknown Title'), 
                    row.get('url', ''),
                    row.get('country', ''),
                    row.get('date', ''),
                    row.get('similarity', 0)
                ])
        
        print(f"Results saved to: {output_csv_path}")
        return True
    except Exception as e:
        print(f"Error writing to CSV: {e}")
        return False

if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="Search articles (API tester).")
    parser.add_argument("query", help="The search query string")
    parser.add_argument("--threshold", type=float, required=True, help="Similarity threshold")
    parser.add_argument("--count", type=int, required=True, help="Number of results")
    parser.add_argument("--csv", help="Output CSV filename", default="search_results.csv")
    
    args = parser.parse_args()
    
    try:
        results = search_articles(args.query, args.threshold, args.count)
        
        if args.csv:
            save_results_to_csv(results, args.csv)
        else:
            # Print JSON if no CSV requested (or both?) user asked to keep it as a test function
            print(json.dumps(results, indent=2))
            
    except Exception as e:
        print(f"Error during search: {e}")
        import traceback
        traceback.print_exc()
