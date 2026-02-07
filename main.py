
import requests
import pandas as pd
import io
import time
import zipfile
from datetime import datetime

# GDELT 2.0 Global Knowledge Graph (GKG)
# GDELT 2.0 Global Knowledge Graph (GKG)
MASTER_URL_TRANSLATION = "http://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
MASTER_URL_ORIGINAL = "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"

ORIGINAL_ARCHIVE_FILE = "original_live_news.csv"
ARCHIVE_FILE = "live_news.csv"

# --- CONFIGURATION: SELECT FIELDS TO EXTRACT ---
# You can comment out lines to exclude them.
# The keys are the column indices (0-indexed), values are the column names.
GKG_FIELDS = {
    1:  'date',              # Article timestamp
    3:  'source_name',       # News outlet
    4:  'url',               # Article URL

    7:  'country',           # Country mentioned
    8:  'state',             # State / region
    9:  'city',              # City

    10: 'primary_category',  # Broad topic (Politics, Econ, etc.)

    11: 'themes',            # What the article is about (semantic)
    15: 'persons',           # People mentioned
    16: 'organizations',     # Orgs, companies, gov agencies
    17: 'locations',         # Places mentioned in text
}

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
        
        # We need to process line-by-line to apply the user's specific logic
        # regarding column dropping before extraction.
        rows = []
        
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            # GDELT zips usually contain one file
            filename = z.namelist()[0]
            with z.open(filename) as f:
                for raw_line in f:
                    # Decode (GDELT is usually ISO-8859-1 / Latin-1)
                    try:
                        line = raw_line.decode('latin-1').rstrip('\n')
                    except:
                        line = raw_line.decode('utf-8', errors='ignore').rstrip('\n')
                        
                    cols = line.split('\t')
                    
                    # --- USER REQUESTED LOGIC START ---
                    # "Drop V2Tone completely"
                    # Note: This removes the LAST column.
                    cols = cols[:-1]
                    # --- USER REQUESTED LOGIC END ---
                    
                    # Extract fields based on GKG_FIELDS configuration
                    row_data = {}
                    for idx, name in GKG_FIELDS.items():
                        # Safety check for index existence
                        if idx < len(cols):
                            value = cols[idx]
                            row_data[name] = value
                        else:
                            row_data[name] = None
                    
                    rows.append(row_data)
        
        # Create DataFrame from the processed list
        df = pd.DataFrame(rows)
                         
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
