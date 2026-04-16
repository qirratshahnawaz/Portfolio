import time
from typing import Dict, List, Optional
import logging

# Set up logging
from logging_config import get_logger
logger = get_logger(__name__)

class RateLimiter:
    """
    A simple in-memory rate limiter using the sliding window algorithm.
    Default: 100 requests per hour per session.
    """
    def __init__(self, default_limit: int = 100, window: int = 3600):
        self.default_limit = default_limit
        self.window = window
        self.sessions: Dict[str, List[float]] = {}

    def is_allowed(self, session_id: str, limit: Optional[int] = None) -> bool:
        """
        Check if a request from session_id is allowed.
        """
        current_limit = limit or self.default_limit
        now = time.time()
        
        # Initialize session if not exists
        if session_id not in self.sessions:
            self.sessions[session_id] = []
            
        # Clean up old requests outside the current window
        cutoff = now - self.window
        self.sessions[session_id] = [t for t in self.sessions[session_id] if t > cutoff]
        
        # Check if under the limit
        if len(self.sessions[session_id]) < current_limit:
            self.sessions[session_id].append(now)
            return True
            
        logger.warning(f"Rate limit exceeded for session: {session_id}")
        return False

# Global instance for the application
rate_limiter = RateLimiter(default_limit=100, window=3600)

def check_rate_limit(session_id: str) -> bool:
    """
    Helper function to check rate limit for a session.
    """
    return rate_limiter.is_allowed(session_id)
