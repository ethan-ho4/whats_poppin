
import pandas as pd
import os
import sys

# Ensure we can import SupabaseClient
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db_handle.supabase_client import SupabaseClient
from dotenv import load_dotenv

# Load env vars
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(root_dir, ".env"))


import pandas as pd
import os
import sys

# Ensure we can import SupabaseClient
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db_handle.supabase_client import SupabaseClient
from dotenv import load_dotenv

# Load env vars
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(root_dir, ".env"))

CSV_FILE = "news.csv"

def is_non_english(text):
    """Returns True if text appears to be non-English (high non-ASCII ratio)."""
    if not text: 
        return False
    non_ascii_count = sum(1 for c in text if ord(c) > 127)
    return (non_ascii_count / len(text)) > 0.2

def cleanup():
    print("--- Bulk Cleaning Non-English Articles ---")
    
    # 1. Clean Supabase
    print("\n1. Scanning Supabase (fetching ALL rows)...")
    try:
        client = SupabaseClient()
        
        all_articles = []
        batch_size = 1000
        start = 0
        
        while True:
            # Fetch batch
            print(f"   Fetching range {start} to {start + batch_size}...")
            res = client.supabase.table("articles").select("id, title, url").range(start, start + batch_size - 1).execute()
            batch = res.data
            
            if not batch:
                break
                
            all_articles.extend(batch)
            
            if len(batch) < batch_size:
                break
                
            start += batch_size
            
        print(f"   Total articles scanned: {len(all_articles)}")
        
        ids_to_delete = []
        
        for art in all_articles:
            if is_non_english(art.get('title', '')):
                ids_to_delete.append(art['id'])
                # print(f"   [Candidate] {art.get('title')[:30]}...") 
        
        if ids_to_delete:
            print(f"   Found {len(ids_to_delete)} non-English articles in total.")
            confirm = input("   Delete these from Supabase? (y/n): ")
            if confirm.lower() == 'y':
                # Delete in batches of 1000 to avoid URL length limits
                chunk_size = 500
                total_deleted = 0
                for i in range(0, len(ids_to_delete), chunk_size):
                    chunk = ids_to_delete[i:i + chunk_size]
                    client.supabase.table("articles").delete().in_("id", chunk).execute()
                    total_deleted += len(chunk)
                    print(f"   Deleted batch {i}-{i+len(chunk)}...")
                print(f"   Success: Deleted {total_deleted} entries.")
            else:
                print("   Skipped database deletion.")
        else:
            print("   No non-English articles found in Supabase.")
            
    except Exception as e:
        print(f"   Error connecting/cleaning Supabase: {e}")

    # 2. Clean CSV
    print(f"\n2. Scanning {CSV_FILE}...")
    if os.path.exists(CSV_FILE):
        try:
            df = pd.read_csv(CSV_FILE)
            initial_count = len(df)
            
            # Filter rows
            # We want rows where is_non_english is False
            df_clean = df[~df['title'].apply(lambda x: is_non_english(str(x)))]
            
            removed_count = initial_count - len(df_clean)
            
            if removed_count > 0:
                print(f"   Found {removed_count} non-English rows in CSV.")
                # We can just check urls_to_delete if we want consistency, but let's trust the heuristic
                
                confirm = input("   Overwrite CSV with cleaned data? (y/n): ")
                if confirm.lower() == 'y':
                    df_clean.to_csv(CSV_FILE, index=False)
                    print(f"   Success: Cleaned {CSV_FILE}.")
                else:
                    print("   Skipped CSV update.")
            else:
                print("   No non-English entries found in CSV.")
        except Exception as e:
            print(f"   Error reading/writing CSV: {e}")
    else:
        print(f"   CSV file {CSV_FILE} not found.")

if __name__ == "__main__":
    cleanup()

