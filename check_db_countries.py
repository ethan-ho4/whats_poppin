import os
import sys
from dotenv import load_dotenv

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

load_dotenv()

try:
    from server.db_handle.supabase_client import SupabaseClient
    from supabase import create_client, Client
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    supabase = create_client(url, key)
    
    res = supabase.table("articles").select("location_names, location_countries, first_location_lat, first_location_lon").limit(10).execute()
    print("Database Samples:")
    for item in res.data:
        print(f"Names: {item.get('location_names')} | Countries: {item.get('location_countries')}")
except Exception as e:
    print(f"Error: {e}")
