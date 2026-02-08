
import requests
import pandas as pd
import io
import time
import zipfile
from datetime import datetime
from deep_translator import GoogleTranslator
import html
from concurrent.futures import ThreadPoolExecutor, as_completed
import re

# GDELT 2.0 Global Knowledge Graph (GKG)
MASTER_URL_TRANSLATION = "http://data.gdeltproject.org/gdeltv2/masterfilelist-translation.txt"
MASTER_URL_ORIGINAL = "http://data.gdeltproject.org/gdeltv2/masterfilelist.txt"

ARCHIVE_FILE = "news.csv"  # Cleaned, English titles
ARCHIVE_FILE_RAW = "news_raw.csv"  # Raw, original titles, uncleaned themes/locations

# --- CONFIGURATION: SELECT FIELDS TO EXTRACT ---
# NOTE: GDELT GKG uses tab-separated format with 27 columns (0-indexed)
# See GDELT_GKG_FIELDS.txt for complete field reference

# Simple fields (direct extraction - no parsing needed)
SIMPLE_FIELDS = {
    1:  'date',              # Article publication date (YYYYMMDDHHMMSS)
    3:  'source_name',       # News outlet (e.g., "cnn.com")
    4:  'url',               # Article URL
}

# Complex fields that need parsing (see parsing functions below)
# These contain semicolon-delimited data with sub-fields
COMPLEX_FIELDS = {
    6:  'v2_counts',         # Death counts, protests, arrests (needs parsing)
    8:  'v2_themes',         # Article themes/topics (needs parsing)
    # Note: V2Persons, V2Organizations, V2Locations, V2Tone are in the last few columns
    # Their exact indices can vary. We'll detect them dynamically or use -1, -2, -3, -4
}

# Configuration: Which parsed sub-fields to extract
EXTRACT_CONFIG = {
    'themes': True,           # Extract theme names (as "simple tags")
    'locations': True,        # Extract location data
    'page_title': True,       # Extract article title from V2Extras field
    
    # Disable other complex fields per user request
    'persons': False,
    'organizations': False,
    'tone': False,
    'counts': False,
    
    # Sub-options for locations
    'location_limit': 3,      # Max number of locations to extract per article (0 = all)
    'extract_coordinates': True,  # Include lat/long in output
    
    # Sub-options for tone
    'tone_overall_only': True,
}

# ============================================================================
# PARSING FUNCTIONS FOR COMPLEX GDELT FIELDS
# ============================================================================

def parse_v2_extras_title(extras_str):
    """
    Parse V2Extras XML field to extract the page title.
    Input: "...,<PAGE_TITLE>Article Headline</PAGE_TITLE>,..."
    Output: "Article Headline"
    """
    if not extras_str or '<PAGE_TITLE>' not in extras_str:
        return None
    
    try:
        start_tag = '<PAGE_TITLE>'
        end_tag = '</PAGE_TITLE>'
        start_idx = extras_str.find(start_tag)
        if start_idx != -1:
            start_idx += len(start_tag)
            end_idx = extras_str.find(end_tag, start_idx)
            if end_idx != -1:
                return extras_str[start_idx:end_idx]
    except Exception:
        pass
    return None

def parse_v2_themes(themes_str):
    """
    Parse V2Themes field to extract theme names with frequency counts.
    Input: "TAX_FNCACT;WB_632_EDUCATION;TAX_FNCACT;CRISISLEX_CRISIS"
    Output: ["TAX_FNCACT (2x)", "WB_632_EDUCATION", "CRISISLEX_CRISIS"]
    """
    if not themes_str or themes_str.strip() == '':
        return []
    
    from collections import Counter
    
    themes = []
    for theme_block in themes_str.split(';'):
        if theme_block:
            # Some themes have comma-separated offsets, we only want the theme name
            theme_name = theme_block.split(',')[0]
            themes.append(theme_name)
    
    # Count occurrences and format with frequency
    theme_counts = Counter(themes)
    result = []
    for theme, count in theme_counts.items():
        if count > 1:
            result.append(f"{theme}:{count}")
        else:
            result.append(theme)
    
    return result

def parse_v2_persons(persons_str):
    """
    Parse V2Persons field to extract person names.
    Input: "Joe Biden,234,9;Kamala Harris,567,13"
    Output: ["Joe Biden", "Kamala Harris"]
    """
    if not persons_str or persons_str.strip() == '':
        return []
    
    persons = []
    for person_block in persons_str.split(';'):
        if person_block:
            # Format: Name,Offset,Length - we only want the name
            person_name = person_block.split(',')[0]
            persons.append(person_name)
    return persons

def parse_v2_organizations(orgs_str):
    """
    Parse V2Organizations field to extract organization names.
    Input: "United Nations,134,14;Apple Inc,789,9"
    Output: ["United Nations", "Apple Inc"]
    """
    if not orgs_str or orgs_str.strip() == '':
        return []
    
    orgs = []
    for org_block in orgs_str.split(';'):
        if org_block:
            # Format: Name,Offset,Length - we only want the name
            org_name = org_block.split(',')[0]
            orgs.append(org_name)
    return orgs

def parse_v2_locations(locations_str, extract_coords=True, limit=0):
    """
    Parse V2Locations field to extract location data with frequency counts.
    Input: "4#Paris#FR#A8#75#48.8566#2.3522#FR12345#892;1#United States#US#..."
    Output: List of dicts with location info (deduplicated by name with counts)
    
    Format: LocationType#FullName#CountryCode#ADM1#ADM2#Lat#Long#FeatureID#Offset
    LocationType: 1=COUNTRY, 2=USSTATE, 3=USCITY, 4=WORLDCITY, 5=WORLDSTATE
    """
    if not locations_str or locations_str.strip() == '':
        return []
    
    from collections import Counter
    
    # First pass: collect all locations with their data
    all_locations = []
    location_names = []
    
    for loc_block in locations_str.split(';'):
        if loc_block:
            parts = loc_block.split('#')
            if len(parts) >= 7:
                location = {
                    'name': parts[1] if len(parts) > 1 else '',
                    'country_code': parts[2] if len(parts) > 2 else '',
                }
                
                if extract_coords and len(parts) >= 7:
                    try:
                        location['lat'] = float(parts[5])
                        location['lon'] = float(parts[6])
                    except (ValueError, IndexError):
                        location['lat'] = None
                        location['lon'] = None
                
                all_locations.append(location)
                location_names.append(location['name'])
    
    # Count occurrences of each location name
    name_counts = Counter(location_names)
    
    # Deduplicate: keep first occurrence of each unique location, add count
    seen = set()
    deduplicated = []
    
    for loc in all_locations:
        if loc['name'] not in seen:
            seen.add(loc['name'])
            count = name_counts[loc['name']]
            
            # Add count to name if > 1
            if count > 1:
                loc['name'] = f"{loc['name']}:{count}"
            
            deduplicated.append(loc)
            
            if limit > 0 and len(deduplicated) >= limit:
                break
    
    return deduplicated

def parse_v2_tone(tone_str, overall_only=True):
    """
    Parse V2Tone field to extract sentiment metrics.
    Input: "-2.5,3.2,5.7,2.5,12.3,4.8"
    Output: Dict with tone metrics or just overall tone score
    
    Six dimensions (comma-separated):
    1. Tone (overall sentiment: -100 to +100)
    2. Positive Score (% positive words)
    3. Negative Score (% negative words)
    4. Polarity (abs difference)
    5. Activity Reference Density
    6. Self/Group Reference Density
    """
    if not tone_str or tone_str.strip() == '':
        return None
    
    parts = tone_str.split(',')
    
    if overall_only:
        try:
            return float(parts[0])
        except (ValueError, IndexError):
            return None
    else:
        try:
            return {
                'tone': float(parts[0]) if len(parts) > 0 else None,
                'positive': float(parts[1]) if len(parts) > 1 else None,
                'negative': float(parts[2]) if len(parts) > 2 else None,
                'polarity': float(parts[3]) if len(parts) > 3 else None,
                'activity': float(parts[4]) if len(parts) > 4 else None,
                'self_reference': float(parts[5]) if len(parts) > 5 else None,
            }
        except ValueError:
            return None

def parse_v2_counts(counts_str):
    """
    Parse V2Counts field to extract count data.
    Input: "KILL#50#militants#Baghdad;PROTEST#1000#students#Paris"
    Output: List of dicts with count info
    
    Format: CountType#Number#ObjectType#Location
    """
    if not counts_str or counts_str.strip() == '':
        return []
    
    counts = []
    for count_block in counts_str.split(';'):
        if count_block:
            parts = count_block.split('#')
            if len(parts) >= 2:
                count = {
                    'type': parts[0] if len(parts) > 0 else '',
                    'number': parts[1] if len(parts) > 1 else '',
                    'object': parts[2] if len(parts) > 2 else '',
                    'location': parts[3] if len(parts) > 3 else '',
                }
                counts.append(count)
    
    return counts

def clean_theme_name(theme_code):
    """
    Cleans a GDELT theme code into a human-readable string.
    Example: "TAX_FNCACT_PRESIDENT" -> "President"
    Example: "WB_696_PUBLIC_SECTOR_MANAGEMENT" -> "Public Sector Management"
    """
    if not theme_code:
        return ""
    
    # Remove count if present (e.g., "THEME:5")
    if ':' in theme_code:
        theme_names = theme_code.split(':')
        theme_code = theme_names[0]
        # Keep count if needed, but for embedding name is key
    
    cleaned = theme_code
    
    # Remove common prefixes
    prefixes = [
        r"TAX_FNCACT_", r"TAX_ETHNICITY_", r"TAX_WORLDLANGUAGES_", r"TAX_WORLDMAMMALS_", 
        r"TAX_POLITICAL_PARTY_", r"TAX_",
        r"WB_\d+_", r"WB_",
        r"CRISISLEX_C\d+_", r"CRISISLEX_T\d+_", r"CRISISLEX_O\d+_", r"CRISISLEX_",
        r"UNGP_", r"SOC_", r"ECON_", r"ENV_", r"EPU_POLICY_", r"EPU_", r"GEN_",
        r"USPEC_", r"LEADER", r"GENERAL_", r"GOV_"
    ]
    
    for prefix in prefixes:
        cleaned = re.sub(f"^{prefix}", "", cleaned)
        
    # Replace underscores with spaces and Title Case
    cleaned = cleaned.replace('_', ' ').title().strip()
    
    return cleaned

def clean_location_name(location_name):
    """
    Cleans a location name to Title Case.
    Most GDELT locations are already readable (e.g., "Paris"), just need formatting.
    """
    if not location_name:
        return ""
    
    # Remove count if present
    if ':' in location_name:
        parts = location_name.split(':')
        location_name = parts[0]
        
    return location_name.title()

# ============================================================================
# GDELT DATA FETCHING AND PROCESSING
# ============================================================================

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

def process_file(url, is_translation_stream=False):
    """Downloads and extracts relevant news metadata to both archive files.
    
    Args:
        url: URL of the GDELT GKG file to download
        is_translation_stream: If True, this is from the translation stream (non-English)
    """
    print(f"Downloading update from: {url}")
    if is_translation_stream:
        print(f"  [Translation stream - will translate titles to English]")
    try:
        r = requests.get(url)
        r.raise_for_status()
        
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
                    
                    # Initialize row data with simple fields
                    row_data = {}
                    
                    # Extract simple fields
                    for idx, name in SIMPLE_FIELDS.items():
                        if idx < len(cols):
                            row_data[name] = cols[idx]
                        else:
                            row_data[name] = None
                    
                    # Extract Page Title (from V2Extras - usually last column)
                    if EXTRACT_CONFIG['page_title']:
                         # Look for <PAGE_TITLE> in columns
                         # Start from the end as it's typically the last column
                        for idx in range(len(cols)-1, 5, -1):
                            if '<PAGE_TITLE>' in cols[idx]:
                                title = parse_v2_extras_title(cols[idx])
                                if title:
                                    row_data['title'] = title
                                    break
                    
                    # V2Counts is at index 6
                    if EXTRACT_CONFIG['counts'] and 6 < len(cols):
                        counts = parse_v2_counts(cols[6])
                        if counts:
                            # Extract first count as example
                            row_data['first_count_type'] = counts[0]['type']
                            row_data['first_count_number'] = counts[0]['number']
                        else:
                            row_data['first_count_type'] = None
                            row_data['first_count_number'] = None
                    
                    if EXTRACT_CONFIG['themes'] and 8 < len(cols):
                        themes = parse_v2_themes(cols[8])
                        if themes:
                            # Raw: just join the original themes
                            row_data['themes_raw'] = ';'.join(themes)
                            
                            # Clean: apply cleaning
                            cleaned_themes = []
                            for t in themes[:5]: # Process top 5 themes for clean version
                                clean = clean_theme_name(t)
                                if clean and clean not in cleaned_themes:
                                    cleaned_themes.append(clean)
                            row_data['themes'] = ';'.join(cleaned_themes) if cleaned_themes else None
                        else:
                            row_data['themes'] = None
                            row_data['themes_raw'] = None
                    
                    # V2Locations has # delimiters and numeric coordinates
                    if EXTRACT_CONFIG['locations']:
                        # Try to identify V2Locations column
                        # Search wide range (down to column 6) to ensure we catch it
                        for idx in range(len(cols)-1, 5, -1):
                            if cols[idx] and '#' in cols[idx]:
                                # Check if it looks like location data (has coordinates)
                                if any(part.replace('.', '').replace('-', '').isdigit() 
                                       for part in cols[idx].split('#')[:7]):
                                    locations = parse_v2_locations(
                                        cols[idx],
                                        EXTRACT_CONFIG['extract_coordinates'],
                                        EXTRACT_CONFIG['location_limit']
                                    )
                                    if locations:
                                        # Raw: original names
                                        row_data['location_names_raw'] = ';'.join([loc['name'] for loc in locations])
                                        
                                        # Clean: apply cleaning
                                        cleaned_loc_names = []
                                        for loc in locations:
                                            clean = clean_location_name(loc['name'])
                                            if clean and clean not in cleaned_loc_names:
                                                cleaned_loc_names.append(clean)
                                        
                                        row_data['location_names'] = ';'.join(cleaned_loc_names)
                                        row_data['location_countries'] = ';'.join([loc['country_code'] for loc in locations])
                                        if EXTRACT_CONFIG['extract_coordinates'] and locations[0].get('lat'):
                                            row_data['first_location_lat'] = locations[0]['lat']
                                            row_data['first_location_lon'] = locations[0]['lon']
                                    break
                                        
                    # V2Persons, Organizations, Tone skipped based on config
                    
                    rows.append(row_data)
        
        # Create raw DataFrame (original titles, raw themes, raw locations)
        # We need to copy relevant fields
        rows_raw = []
        for r in rows:
            raw_row = r.copy()
            # Restore raw fields to main names for the raw file
            if 'themes_raw' in r:
                raw_row['themes'] = r['themes_raw']
            if 'location_names_raw' in r:
                raw_row['location_names'] = r['location_names_raw']
            rows_raw.append(raw_row)
            
        df_raw = pd.DataFrame(rows_raw)
        
        # Translate titles if this is from translation stream (parallel translation for speed)
        # Only for the main 'rows' list which goes to news.csv
        if is_translation_stream and rows:
            print(f"  [Translating {len(rows)} titles in parallel...]")
            titles_to_translate = []
            title_indices = []
            
            for idx, row in enumerate(rows):
                if row.get('title'):
                    # Decode HTML entities
                    decoded_title = html.unescape(row['title'])
                    
                    # Determine if translation is needed
                    should_translate = is_translation_stream
                    
                    # Heuristic: Check for non-English characters in "Original" stream
                    if not should_translate:
                        # Count non-ASCII characters
                        non_ascii_count = sum(1 for c in decoded_title if ord(c) > 127)
                        # If more than 20% of chars are non-ASCII, assume it's foreign (e.g. Chinese, Arabic)
                        if len(decoded_title) > 0 and (non_ascii_count / len(decoded_title)) > 0.2:
                            should_translate = True
                            print(f"  [Detected non-English title in English stream: {decoded_title[:40]}...]")

                    if should_translate:
                        titles_to_translate.append(decoded_title)
                        title_indices.append(idx)
            
            if titles_to_translate:
                def translate_single(title):
                    """Translate a single title, return original on error"""
                    try:
                        translator = GoogleTranslator(source='auto', target='en')
                        return translator.translate(title)
                    except Exception:
                        return title  # Keep original if translation fails
                
                try:
                    translated_titles = []
                    
                    # Use ThreadPoolExecutor to translate multiple titles in parallel
                    # 10 workers = ~10x faster than sequential
                    with ThreadPoolExecutor(max_workers=10) as executor:
                        # Submit all translation tasks
                        future_to_idx = {executor.submit(translate_single, title): idx 
                                        for idx, title in enumerate(titles_to_translate)}
                        
                        # Collect results as they complete
                        results = [None] * len(titles_to_translate)
                        completed = 0
                        for future in as_completed(future_to_idx):
                            idx = future_to_idx[future]
                            results[idx] = future.result()
                            completed += 1
                            
                            # Show progress every 100 titles
                            if completed % 100 == 0 or completed == len(titles_to_translate):
                                print(f"  [Translated {completed}/{len(titles_to_translate)} titles...]")
                        
                        translated_titles = results
                    
                    # Assign translated titles back to rows
                    for idx, title_idx in enumerate(title_indices):
                        if idx < len(translated_titles):
                            rows[title_idx]['title'] = translated_titles[idx]
                    
                    print(f"  [Successfully translated {len(translated_titles)} titles]")
                except Exception as e:
                    print(f"  [Translation failed, keeping original titles: {e}]")
        
        # Create English DataFrame (with translated titles if applicable)
        df_english = pd.DataFrame(rows)
        
        # Reorder columns: core fields first, then themes/locations
        column_order = ['date', 'source_name', 'url', 'title', 'themes', 
                       'location_names', 'location_countries', 
                       'first_location_lat', 'first_location_lon']
        # Only include columns that exist in the dataframe
        column_order = [col for col in column_order if col in df_english.columns]
        df_english = df_english[column_order]
                         
        print(f"Extracted {len(df_english)} rows.")
        
        if not df_raw.empty:
            # Apply same column order to raw dataframe
            df_raw = df_raw[column_order]
            header_raw = not pd.io.common.file_exists(ARCHIVE_FILE_RAW)
            df_raw.to_csv(ARCHIVE_FILE_RAW, mode='a', header=header_raw, index=False)
        
        if not df_english.empty:
            header_english = not pd.io.common.file_exists(ARCHIVE_FILE)
            df_english.to_csv(ARCHIVE_FILE, mode='a', header=header_english, index=False)
            print(f"Success. Appended to {ARCHIVE_FILE} (Cleaned/Translated) and {ARCHIVE_FILE_RAW} (Raw/Original)")
            
            # --- Vector DB Integration ---
            # --- Vector DB Integration ---
            try:
                # We need to import here to avoid circular dependencies if any, 
                # or just to keep it isolated.
                # Adjust path to ensure we can import supabase_client
                import sys
                import os
                # current_dir is server/
                current_dir = os.path.dirname(os.path.abspath(__file__))
                if current_dir not in sys.path:
                    sys.path.append(current_dir)
                    
                from db_handle.supabase_client import SupabaseClient
                
                print("  [Ingesting into Supabase...]")
                # Initialize Supabase (needs .env loaded, which usually main.py does, 
                # but if running news_retrieve separately, might need load_dotenv)
                # Let's try to load .env if not set
                if not os.getenv("SUPABASE_URL"):
                    from dotenv import load_dotenv
                    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                    load_dotenv(os.path.join(root_dir, ".env"))
                
                db = SupabaseClient()
                
                # Convert DataFrame to list of dicts for ingestion
                # We need to map df columns to what add_articles expects
                articles_to_ingest = []
                for _, row in df_english.iterrows():
                    articles_to_ingest.append({
                        'title': row.get('title', ''),
                        'url': row.get('url', ''),
                        'date': str(row.get('date', '')),
                        'themes': row.get('themes', ''),
                        'location_names': row.get('location_names', '')
                    })
                
                # Use simplified add_articles which handles embeddings
                db.add_articles(articles_to_ingest)
                print(f"  [Successfully ingested {len(articles_to_ingest)} articles into Supabase]")
                
            except Exception as e:
                print(f"  [Warning: Supabase Ingestion Failed: {e}]")
                # Don't fail the whole pipeline just because DB ingest failed
                pass
            # -----------------------------
            
            return True
        return False
        
    except Exception as e:
        print(f"Error processing file: {e}")
        import traceback
        traceback.print_exc()
        return False

def run_pipeline():
    last_processed_trans = None
    last_processed_orig = None
    
    print("--- Starting GDELT 15-Minute Mass News Pipeline ---")
    print(f"English Titles (Cleaned): {ARCHIVE_FILE}")
    print(f"Raw Data (Original): {ARCHIVE_FILE_RAW}")
    print("---------------------------------------------------")
    
    while True:
        # Check Translation Feed (non-English articles -> translate to English)
        url_trans = get_latest_url(MASTER_URL_TRANSLATION)
        if url_trans and url_trans != last_processed_trans:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New TRANSLATED update detected!")
            if process_file(url_trans, is_translation_stream=True):
                last_processed_trans = url_trans
        
        # Check Original Feed (English articles -> no translation needed)
        url_orig = get_latest_url(MASTER_URL_ORIGINAL)
        if url_orig and url_orig != last_processed_orig:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] New ORIGINAL update detected!")
            if process_file(url_orig, is_translation_stream=False):
                last_processed_orig = url_orig
                
        if not url_trans and not url_orig:
             print(f"[{datetime.now().strftime('%H:%M:%S')}] Waiting for updates...")
            
        time.sleep(60)

if __name__ == "__main__":
    try:
        run_pipeline()
    except KeyboardInterrupt:
        print("\nStopping pipeline.")
