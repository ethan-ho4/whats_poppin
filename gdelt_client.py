
import requests
import pandas as pd
from datetime import datetime
from typing import List, Dict, Optional, Union

class GDELTClient:
    """
    Client for interacting with the GDELT 2.0 Doc API.
    Documentation: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
    """
    
    BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

    def __init__(self):
        pass

    def search(self, 
               query: str, 
               mode: str = "ArtList", 
               format: str = "json", 
               max_records: int = 250, 
               timespan: Optional[str] = None,
               sort: str = "DateDesc",
               translate: bool = False) -> Union[pd.DataFrame, List[Dict]]:
        """
        Search GDELT for news articles.

        Args:
            query: The search query (e.g., "climate change"). Supports boolean operators.
            mode: The mode of operation (default: "ArtList"). Other options: "TimelineVol", "TimelineTone".
            format: Response format (default: "json").
            max_records: Maximum number of records to return (default: 250).
            timespan: Optional timespan (e.g., "1 week", "24 hours"). If None, defaults to 3 months.
            sort: Sort order for ArtList mode (default: "DateDesc"). Options: "DateAsc", "ToneDesc", "ToneAsc".
            translate: If True, attempts to translate results to English using GDELT's built-in translation (trans=googtrans).

        Returns:
            A pandas DataFrame containing the search results if format is "json" or "csv", 
            otherwise the raw response.
        """
        
        params = {
            "query": query,
            "mode": mode,
            "format": format,
            "maxrecords": max_records,
            "sort": sort
        }

        if timespan:
            params["timespan"] = timespan
            
        if translate:
            params["trans"] = "googtrans"

        try:
            response = requests.get(self.BASE_URL, params=params)
            response.raise_for_status()
            
            if format.lower() == "json":
                data = response.json()
                if "articles" in data:
                    return pd.DataFrame(data["articles"])
                elif "timeline" in data: # Handle timeline modes
                     return pd.DataFrame(data["timeline"][0]["data"])
                else:
                    return data # Fallback
            elif format.lower() == "csv":
                # Basic CSV parsing if needed, but JSON is preferred
                return response.text
            else:
                return response.text

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from GDELT: {e}")
            return pd.DataFrame()

    def get_timeline_volume(self, query: str, timespan: str = "3 months") -> pd.DataFrame:
        """
        Get the volume of coverage over time for a query.
        """
        return self.search(query, mode="TimelineVol", timespan=timespan)

    def get_latest_news(self, query: str = "sourcelang:eng", max_records: int = 10) -> pd.DataFrame:
        """
        Get the latest English news.
        """
        return self.search(query, mode="ArtList", max_records=max_records, sort="DateDesc")

