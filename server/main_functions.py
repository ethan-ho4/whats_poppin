from server.fuzzy_search import fuzzy_search

async def handle_chat(query: str):
    """
    LOGIC HANDLER: Called by main.py to process the query.
    This is where the actual 'thinking' or processing happens.
    """
    # 1. We receive the query from main.py
    print(f"Processing query in main_functions: {query}")
    
    # 2. Correct the spelling of the query (English dictionary)
    corrected_query = fuzzy_search(query, [])
    
    print(f"Spell Check Result: '{corrected_query}'")
    
    # 3. Return the corrected query
    return corrected_query
