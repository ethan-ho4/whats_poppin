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
    print("--- Checking Vector Database Status ---")
    
    try:
        db = VectorDB()
        
        # 1. Check Count
        count = db.collection.count()
        print(f"\nTotal Articles stored: {count}")
        
        if count > 0:
            print("\n--- Sample Data (First 3 items) ---")
            # peek() returns dict with keys: ids, embeddings, metadatas, documents
            data = db.collection.peek(limit=3)
            
            ids = data['ids']
            metadatas = data['metadatas']
            embeddings = data['embeddings']
            
            for i in range(len(ids)):
                meta = metadatas[i]
                emb = embeddings[i]
                print(f"\n[{i+1}] ID: {ids[i]}")
                print(f"    Title: {meta.get('title', 'N/A')}")
                print(f"    Date: {meta.get('date', 'N/A')}")
                print(f"    Themes: {meta.get('themes', '')}")
                print(f"    Locations: {meta.get('locations', '')}")
                print(f"    Embedding: Shape {len(emb) if emb is not None else 'None'}")
                if emb is not None:
                    print(f"    Vector Preview: {emb[:5]}...")
        else:
            print("\n[!] The database is empty. Run 'python server/ingest.py --limit 0' to populate it.")
            
    except Exception as e:
        print(f"\n[Error] Could not connect to database: {e}")

if __name__ == "__main__":
    main()
