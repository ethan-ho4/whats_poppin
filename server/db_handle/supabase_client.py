
import os
import sys
from supabase import create_client, Client

# Ensure we can import the embed model
try:
    from server.model.embed import embed_text
except ImportError:
    # If running directly or from different context
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    try:
        from model.embed import embed_text
    except ImportError:
        # Fallback
        from server.model.embed import embed_text

class SupabaseClient:
    def __init__(self):
        url: str = os.environ.get("SUPABASE_URL")
        key: str = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in environment variables.")
        self.supabase: Client = create_client(url, key)

    def insert_article(self, article_data):
        """
        Inserts a single article into the 'articles' table.
        Args:
            article_data (dict): Dictionary matching the table schema.
        """
        try:
            response = self.supabase.table("articles").upsert(article_data, on_conflict="url").execute()
            return response
        except Exception as e:
            print(f"Error inserting article: {e}")
            return None

    def add_articles(self, articles):
        """
        Add a list of articles to Supabase, generating embeddings automatically.
        
        Args:
            articles: List of dicts, each containing:
                - title
                - themes (string)
                - location_names (string)
                - url
                - date
        """
        if not articles:
            return

        print(f"Processing {len(articles)} articles for Supabase...")

        # Prepare batch data for embedding
        titles = []
        themes_list = []
        locations_list = []
        
        for row in articles:
            titles.append(str(row.get('title', '')))
            themes_list.append(str(row.get('themes', '')))
            locations_list.append(str(row.get('location_names', '')))
            
        # Generate embeddings in batches
        print("Generating title embeddings...")
        title_embeddings = embed_text(titles)
        
        print("Generating theme embeddings...")
        theme_embeddings = embed_text(themes_list)
        
        print("Generating location embeddings...")
        location_embeddings = embed_text(locations_list)
        
        # Prepare inserts
        batch_data = []
        for i, row in enumerate(articles):
            article_data = {
                "url": row.get('url', ''),
                "title": row.get('title', ''),
                "date": str(row.get('date', '')),
                "themes": str(row.get('themes', '')),
                "location_names": str(row.get('location_names', '')),
                "title_embedding": title_embeddings[i].tolist() if title_embeddings is not None else None,
                "themes_embedding": theme_embeddings[i].tolist() if theme_embeddings is not None else None,
                "locations_embedding": location_embeddings[i].tolist() if location_embeddings is not None else None
            }
            batch_data.append(article_data)
        
        # Upsert to Supabase
        print(f"Upserting {len(batch_data)} articles to Supabase...")
        count = 0
        for article in batch_data:
            # We insert one by one for safety, or we could try batching if Supabase allows large payloads
            # Basic Supabase upsert allows list of dicts.
            # Let's try inserting in chunks of 50 to avoid request size limits
            # But the 'insert_article' method is single.
            # Let's use self.supabase.table("articles").upsert(batch_data).execute() if possible
            # but handling errors row by row is safer for now.
             res = self.insert_article(article)
             if res:
                 count += 1
        
        print(f"Successfully upserted {count}/{len(batch_data)} articles.")

    def search_similar(self, query_embedding, match_threshold=0.5, match_count=5, search_field="title"):
        """
        Search for articles similar to the query embedding.
        
        Args:
            query_embedding: The vector to search with.
            match_threshold: Minimum similarity (0-1).
            match_count: Max results.
            search_field: 'title', 'themes', or 'locations'.
        """
        # Map friendly names to DB column names
        field_map = {
            "title": "title_embedding",
            "themes": "themes_embedding",
            "theme": "themes_embedding",
            "locations": "locations_embedding", 
            "location": "locations_embedding"
        }
        
        db_field = field_map.get(search_field.lower(), "title_embedding")
        
        try:
            response = self.supabase.rpc(
                "match_articles",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": match_count,
                    "search_field": db_field
                }
            ).execute()
            return response.data
        except Exception as e:
            print(f"Error searching articles ({search_field}): {e}")
            return []

    def search_topic(self, query_embedding, match_threshold=0.5, match_count=5):
        """
        Search for articles matching a topic using both Title and Themes embeddings.
        Uses 'match_articles_topic' RPC.
        """
        try:
            response = self.supabase.rpc(
                "match_articles_topic",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": match_count
                }
            ).execute()
            return response.data
        except Exception as e:
            print(f"Error searching topic: {e}")
            return []
