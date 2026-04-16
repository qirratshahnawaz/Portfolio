from typing import Optional
import time


class SanityCacheManager:
    """
    Manages cache configuration and headers for Sanity CDN optimization
    while ensuring fresh data retrieval when needed.
    """

    def __init__(self):
        self.default_ttl = 300  # 5 minutes default TTL
        self.cache_headers = {
            "Cache-Control": "public, max-age=300, stale-while-revalidate=60"
        }

    def get_cache_headers(self, ttl: Optional[int] = None) -> dict:
        """
        Get appropriate cache headers for Sanity queries.

        Args:
            ttl: Time-to-live in seconds. If None, uses default.

        Returns:
            Dictionary of cache headers
        """
        actual_ttl = ttl or self.default_ttl
        stale_revalidate = min(actual_ttl // 2, 300)  # Half of TTL or max 5 mins

        return {
            "Cache-Control": f"public, max-age={actual_ttl}, stale-while-revalidate={stale_revalidate}"
        }

    def should_bust_cache(self, last_updated: Optional[float] = None, threshold: int = 300) -> bool:
        """
        Determine if cache should be busted based on last update time.

        Args:
            last_updated: Unix timestamp of last update
            threshold: Time in seconds after which to bust cache

        Returns:
            True if cache should be busted, False otherwise
        """
        if last_updated is None:
            return False

        current_time = time.time()
        return (current_time - last_updated) < threshold


# Global cache manager instance
cache_manager = SanityCacheManager()