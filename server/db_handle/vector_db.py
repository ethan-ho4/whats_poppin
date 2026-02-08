
import chromadb
import os
import sys

# Ensure we can import the embed model
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

try:
    from server.model.embed import embed_text
except ImportError:
    # If running directly from server/ dir
    from model.embed import embed_text

class VectorDB:
    def __init__(self, persist_directory="chroma_db"):
        """
        Initialize ChromaDB client.
        Stores data locally in 'server/db_handle/chroma_db'.
        """
        # base_dir is where vector_db.py is (server/db_handle)
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.persist_path = os.path.join(base_dir, persist_directory)
        
        print(f"Initializing ChromaDB at: {self.persist_path}")
        self.client = chromadb.PersistentClient(path=self.persist_path)
        
        # Get or create collection
        # cosine distance is default and good for semantic similarity
        self.collection = self.client.get_or_create_collection(
            name="news_articles",
            metadata={"hnsw:space": "cosine"}
        )
        print(f"Collection 'news_articles' loaded. Count: {self.collection.count()}")

    def add_articles(self, articles):
        """
        Add a list of articles to the database.
        
        Args:
            articles: List of dicts, each containing:
                - title
                - themes (clean string)
                - location_names (clean string)
                - url
                - date
        """
        if not articles:
            return
            
        ids = []
        documents = []
        metadatas = []
        embeddings = []
        
        # Prepare data
        texts_to_embed = []
        
        for art in articles:
            # unique ID: hash of URL
            art_id = str(hash(art['url']))
            
            # Rich text representation for embedding
            # "Title. Themes: A, B. Location: C."
            text_rep = f"{art['title']}."
            if art.get('themes'):
                text_rep += f" Themes: {art['themes']}."
            if art.get('location_names'):
                text_rep += f" Location: {art['location_names']}."
            
            ids.append(art_id)
            documents.append(text_rep) # Stored as the raw document text
            texts_to_embed.append(text_rep)
            
            # Metadata must be simple types (str, int, float, bool)
            meta = {
                "title": art['title'],
                "url": art['url'],
                "date": str(art['date']),
                "themes": str(art.get('themes', '')),
                "locations": str(art.get('location_names', ''))
            }
            metadatas.append(meta)
            
        # Generate embeddings in batch
        if texts_to_embed:
            print(f"Generating embeddings for {len(texts_to_embed)} articles...")
            embeddings = embed_text(texts_to_embed)
            
            # Add to collection
            self.collection.upsert(
                ids=ids,
                embeddings=embeddings.tolist(),
                documents=documents,
                metadatas=metadatas
            )
            print(f"Upserted {len(ids)} articles.")

    def query_articles(self, query_text, n_results=10):
        """
        Search for articles semantically similar to query_text.
        """
        print(f"Querying for: '{query_text}'")
        
        query_embedding = embed_text(query_text)
        
        results = self.collection.query(
            query_embeddings=query_embedding.tolist(),
            n_results=n_results
        )
        
        return results

if __name__ == "__main__":
    # Test
    db = VectorDB()
