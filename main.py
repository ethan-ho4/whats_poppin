
import requests
import pandas as pd
import io
import time
import zipfile
from datetime import datetime

# GDELT 2.0 Global Knowledge Graph (GKG)
MASTER_URL_TRANSLATION = "http://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
MASTER_URL_ORIGINAL = "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"

ORIGINAL_ARCHIVE_FILE = "original_live_news.csv"
ARCHIVE_FILE = "live_news.csv"

def get_latest_url(master_url):
    """Fetches the latest GKG file URL from the given master list."""
    try:
        r = requests.get(master_url)
        r.raise_for_status()
        
        lines = r.text.strip().split('\n')
        for line in reversed(lines):
            parts = line.split()
            if len(parts) >= 3 and "gkg.csv.zip" in parts[2]:
                return parts[2]
        return None
    except Exception as e:
        print(f"Error fetching master list from {master_url}: {e}")
        return None

def process_file(url, archive_file):
    """Downloads and extracts relevant news metadata to the specified archive."""
    print(f"Downloading update from: {url}")
    try:
        r = requests.get(url)
        r.raise_for_status()
        
        # 1: DATE, 3: SOURCE, 4: URL, 7: TONE, 9: PERSONS, 11: ORGS, 15: LOCATIONS
        df = pd.read_csv(io.BytesIO(r.content), compression='zip', sep='\t', header=None, 
                         usecols=[1, 3, 4, 7, 9, 11, 15], 
                         names=['date', 'source_name', 'url', 'tone', 'persons', 'organizations', 'locations'],
                         encoding='latin-1', on_bad_lines='skip')
                         
        print(f"Extracted {len(df)} rows.")
        
        if not df.empty:
            header = not pd.io.common.file_exists(archive_file)
            df.to_csv(archive_file, mode='a', header=header, index=False)
            print(f"Success. Appended {len(df)} rows to {archive_file}")
            return True
        return False
        
    except Exception as e:
        print(f"Error processing file: {e}")
        return False

def run_pipeline():
    last_processed_trans = None
    last_processed_orig = None
    
    print("--- Starting GDELT 15-Minute Mass News Pipeline ---")
    print(f"Translated Output: {ARCHIVE_FILE}")
    print(f"Original Output:   {ORIGINAL_ARCHIVE_FILE}")
    print("---------------------------------------------------")
    
    while True:
        # Check Translation Feed
        url_trans = get_latest_url(MASTER_URL_TRANSLATION)
        if url_trans and url_trans != last_processed_trans:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New TRANSLATED update detected!")
            if process_file(url_trans, ARCHIVE_FILE):
                last_processed_trans = url_trans
        
        # Check Original Feed
        url_orig = get_latest_url(MASTER_URL_ORIGINAL)
        if url_orig and url_orig != last_processed_orig:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New ORIGINAL update detected!")
            if process_file(url_orig, ORIGINAL_ARCHIVE_FILE):
                last_processed_orig = url_orig
                
        if not url_trans and not url_orig:
             print(f"[{datetime.now().strftime('%H:%M:%S')}] Waiting for updates...")
            
        time.sleep(60)

if __name__ == "__main__":
    try:
        run_pipeline()
    except KeyboardInterrupt:
        print("\nStopping pipeline.")
