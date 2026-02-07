from sentence_transformers import SentenceTransformer
import numpy as np

# Load the model once when this module is imported
# 'all-MiniLM-L6-v2' is a fast, lightweight choice for general use
print("Loading Hugging Face model locally...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_text(text):
    """
    Generate embeddings for text (single string or list of strings).
    Uses local Hugging Face model 'all-MiniLM-L6-v2'.
    
    Args:
        text: String or List[String]
    
    Returns:
        numpy.ndarray: Embedding vector(s)
    """
    try:
        # Generate the embeddings
        # convert_to_numpy=True returns a numpy array directly
        embeddings = model.encode(text, convert_to_numpy=True)
        return embeddings
    except Exception as e:
        print(f"Error embedding text: {e}")
        return None

def find_most_similar(query_embedding, candidate_embeddings, top_k=5):
    """
    Find most similar embeddings using cosine similarity.
    Helper function for news relevance.
    """
    # Ensure inputs are numpy arrays
    query_embedding = np.array(query_embedding)
    candidate_embeddings = np.array(candidate_embeddings)
    
    # Calculate cosine similarity: (A . B) / (||A|| * ||B||)
    query_norm = np.linalg.norm(query_embedding)
    cand_norms = np.linalg.norm(candidate_embeddings, axis=1)
    
    dot_products = np.dot(candidate_embeddings, query_embedding)
    similarities = dot_products / (query_norm * cand_norms)
    
    # Get top K indices
    top_indices = np.argsort(similarities)[::-1][:top_k]
    
    return [(idx, similarities[idx]) for idx in top_indices]

if __name__ == "__main__":
    # Internal test when running python embed.py
    sentences = [
        "The cat sits outside",
        "A man is playing guitar",
        "The new movie is awesome"
    ]
    print("Generating embeddings...")
    embeddings = embed_text(sentences)
    print(f"Embedding shape: {embeddings.shape}") # (3, 384)
    print(f"First embedding: {embeddings[0][:5]}...")
