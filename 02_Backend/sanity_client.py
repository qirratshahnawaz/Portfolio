from decouple import config
import httpx
from typing import Optional, Any

PROJECT_ID = config("SANITY_PROJECT_ID")
DATASET = config("SANITY_DATASET", default="production")
API_VERSION = "v2025-01-20"
TOKEN = config("SANITY_API_TOKEN")

# API Endpoints
BASE_URL = f"https://{PROJECT_ID}.apicdn.sanity.io/{API_VERSION}/data/query/{DATASET}"
BASE_URL_LIVE = f"https://{PROJECT_ID}.api.sanity.io/{API_VERSION}/data/query/{DATASET}"

def query_sanity(query: str, params: Optional[dict] = None, use_cdn: bool = True) -> Any:
    """Execute a GROQ query via httpx directly."""
    url = BASE_URL if use_cdn else BASE_URL_LIVE
    
    headers = {}
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
        
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.get(
                url,
                params={"query": query, **(params or {})},
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data.get("result", [])
    except Exception as e:
        print(f"Sanity Query Error: {e}")
        return []

def get_profile():
    query = '*[_type == "profile"][0]'
    return query_sanity(query)

def get_projects():
    query = '*[_type == "project"] | order(orderRank asc)'
    return query_sanity(query)

def get_experience():
    query = '*[_type == "experience"] | order(startDate desc)'
    return query_sanity(query)