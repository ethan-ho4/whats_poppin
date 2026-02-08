import sys
import os

# Ensure we can import from server module if running from root
current_dir = os.getcwd()
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    # If run from root
    from server.db_handle.vector_db import VectorDB
except ImportError:
    try:
        # If run from server/db_handle/
        from vector_db import VectorDB
    except ImportError:
        # If run from server/
        sys.path.append(os.path.join(current_dir, 'db_handle'))
        from vector_db import VectorDB

def main():
    print("--- Checking Supabase Database Status ---")
    
    # Load .env if needed
    from dotenv import load_dotenv
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    load_dotenv(os.path.join(root_dir, ".env"))

    try:
        from supabase_client import SupabaseClient
    except ImportError:
        # Fallback if running from different location
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from supabase_client import SupabaseClient

    try:
        client = SupabaseClient()
        
        # 1. Check Count
        # count='exact', head=True returns count without data
        res = client.supabase.table("articles").select("*", count="exact", head=True).execute()
        count = res.count
        print(f"\nTotal Articles stored: {count}")
        
        if count > 0:
            print("\n--- Sample Data (First 3 items) ---")
            res = client.supabase.table("articles").select("*").limit(3).execute()
            data = res.data
            
            for i, item in enumerate(data):
                print(f"\n[{i+1}] ID: {item.get('id', 'N/A')}")
                print(f"    URL: {item.get('url', 'N/A')}")
                print(f"    Title: {item.get('title', 'N/A')}")
                print(f"    Date: {item.get('date', 'N/A')}")
                print(f"    Themes: {item.get('themes', '')[:50]}...")
                print(f"    Locations: {item.get('location_names', '')[:50]}...")
                
                # Check embeddings existence (they are large, so maybe just check length or presence)
                title_emb = item.get('title_embedding')
                print(f"    Title Embedding: {'Present' if title_emb else 'Missing'}")
                if title_emb:
                    # Parse vector string if it comes back as string, or list
                    # Supabase-py might return list of floats
                   pass

        else:
            print("\n[!] The database is empty. Run 'python server/db_handle/ingest.py' to populate it.")
            
    except Exception as e:
        print(f"\n[Error] Could not connect to database: {e}")

if __name__ == "__main__":
    main()
