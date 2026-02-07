import requests
from dotenv import load_dotenv
import os
import numpy as np
import json

def test_embedding():
    """Test the embedding model using direct API calls"""
    # Load environment variables
    load_dotenv()
    TOKEN = os.getenv("TOKEN")
    
    if not TOKEN:
        print("Error: TOKEN not found in .env file.")
        return
    
    print(f"Token loaded successfully: {TOKEN[:5]}...")
    
    # Test text to embed
    test_text = "Paris is the capital of France"
    
    # Try different possible endpoints
    endpoints = [
        "https://app.backboard.io/api/v1/embeddings",
        "https://app.backboard.io/api/embeddings",
        "https://app.backboard.io/v1/embeddings",
        "https://api.backboard.io/v1/embeddings",
    ]
    
    headers = {
        "x-api-key": TOKEN,
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "embed-v4.0-1024",
        "input": test_text
    }
    
    print(f"\nTest text: '{test_text}'")
    print("\nGenerating embedding...")
    print("Model: embed-v4.0-1024 (Cohere)")
    print("Dimensions: 1024")
    
    for url in endpoints:
        print(f"\nTrying endpoint: {url}")
        
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n[SUCCESS] Found working endpoint!")
                print(f"Endpoint: {url}")
                print(f"Response keys: {result.keys()}")
                print(f"Full response:\n{json.dumps(result, indent=2)[:500]}...")
                
                # Try to extract embedding
                if 'embedding' in result:
                    embedding = np.array(result['embedding'])
                    print(f"\nEmbedding shape: {embedding.shape}")
                    print(f"First 10 values: {embedding[:10]}")
                    return
                elif 'data' in result and len(result['data']) > 0:
                    embedding = np.array(result['data'][0]['embedding'])
                    print(f"\nEmbedding shape: {embedding.shape}")
                    print(f"First 10 values: {embedding[:10]}")
                    return
            elif response.status_code == 404:
                print(f"[NOT FOUND] Endpoint doesn't exist")
            else:
                print(f"[ERROR] Status: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                
        except Exception as e:
            print(f"[ERROR] {e}")
    
    print("\n" + "="*60)
    print("[CONCLUSION] None of the endpoints worked.")
    print("Embeddings might not be available as a standalone API.")
    print("They may only be used internally for RAG/document features.")
    print("="*60)

def main():
    print("="*60)
    print("BACKBOARD EMBEDDING MODEL TEST")
    print("="*60)
    
    test_embedding()

if __name__ == "__main__":
    main()
