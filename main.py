
import requests
import pandas as pd
import io
import time
import zipfile
from datetime import datetime

# GDELT 2.0 Global Knowledge Graph (GKG) Translation List
MASTER_URL = "http://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
ARCHIVE_FILE = "live_news.csv"

def get_latest_gkg_url():
    """Fetches the latest GKG file URL from the master list."""
    try:
        r = requests.get(MASTER_URL)
        r.raise_for_status()
        
        lines = r.text.strip().split('\n')
        # Iterate backwards to find latest GKG zip
        for line in reversed(lines):
            parts = line.split()
            if len(parts) >= 3 and "gkg.csv.zip" in parts[2]:
                return parts[2]
        return None
    except Exception as e:
        print(f"Error fetching master list: {e}")
        return None

def process_gkg_file(url):
    """Downloads and extracts relevant news metadata."""
    print(f"Downloading update from: {url}")
    try:
        r = requests.get(url)
        r.raise_for_status()
        
        # Determine column structure (GKG 2.0 has no headers)
        # Using specific columns for efficiency:
        # 1: DATE, 3: SOURCE, 4: URL, 7: TONE, 9: PERSONS, 11: ORGS, 15: LOCATIONS
        df = pd.read_csv(io.BytesIO(r.content), compression='zip', sep='\t', header=None, 
                         usecols=[1, 3, 4, 7, 9, 11, 15], 
                         names=['date', 'source_name', 'url', 'tone', 'persons', 'organizations', 'locations'],
                         encoding='latin-1', on_bad_lines='skip')
                         
        print(f"Extracted {len(df)} rows.")
        return df
    except Exception as e:
        print(f"Error processing file: {e}")
        return pd.DataFrame()

def run_pipeline():
    last_processed_url = None
    
    print("--- Starting GDELT 15-Minute Mass News Pipeline ---")
    print(f"Saving to: {ARCHIVE_FILE}")
    print("---------------------------------------------------")
    
    while True:
        url = get_latest_gkg_url()
        
        if url and url != last_processed_url:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New update detected!")
            df = process_gkg_file(url)
            
            if not df.empty:
                # Append to master CSV
                header = not pd.io.common.file_exists(ARCHIVE_FILE)
                df.to_csv(ARCHIVE_FILE, mode='a', header=header, index=False)
                print(f"Success. Appended {len(df)} rows to {ARCHIVE_FILE}")
                last_processed_url = url
            else:
                print("Update was empty or failed.")
        else:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] No new update yet. Waiting...")
            
        time.sleep(60) # Check every minute

if __name__ == "__main__":
    try:
        run_pipeline()
    except KeyboardInterrupt:
        print("\nStopping pipeline.")
