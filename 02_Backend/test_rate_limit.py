"""
Test to verify rate limiting implementation with 100 requests/hour per session.
"""
import time
from rate_limiter import RateLimiter


def test_rate_limit_implementation():
    """
    Verify that rate limiting works correctly with 100 requests/hour per session.
    """
    # Create a rate limiter with default settings (100 requests per hour)
    limiter = RateLimiter(default_limit=100, window=3600)  # 100 requests per hour (3600 seconds)

    session_id = "sess_test123"

    # Test that initial requests are allowed
    for i in range(5):
        assert limiter.is_allowed(session_id) == True, f"Request {i+1} should be allowed"

    # Test that we can make up to the limit
    for i in range(95):  # We've already made 5, so 95 more should reach the limit of 100
        assert limiter.is_allowed(session_id) == True, f"Request {i+6} should be allowed (at limit)"

    # The next request should be denied
    assert limiter.is_allowed(session_id) == False, "101st request should be denied due to rate limit"

    # Test with a different session - should be allowed
    other_session = "sess_other456"
    assert limiter.is_allowed(other_session) == True, "Request for different session should be allowed"


def test_rate_limit_custom_settings():
    """
    Verify that custom rate limits work correctly.
    """
    limiter = RateLimiter(default_limit=10, window=60)  # 10 requests per minute

    session_id = "sess_custom123"

    # Should allow up to the limit
    for i in range(10):
        assert limiter.is_allowed(session_id, limit=10) == True, f"Request {i+1} should be allowed with custom limit"

    # Next request should be denied
    assert limiter.is_allowed(session_id, limit=10) == False, "11th request should be denied"


def test_rate_limit_window_reset():
    """
    Test that rate limiting window resets after the specified time.
    """
    # Use a shorter window for testing
    limiter = RateLimiter(default_limit=2, window=1)  # 2 requests per 1 second

    session_id = "sess_reset123"

    # Make 2 requests which should be allowed
    assert limiter.is_allowed(session_id) == True, "First request should be allowed"
    assert limiter.is_allowed(session_id) == True, "Second request should be allowed"

    # The third should be denied
    assert limiter.is_allowed(session_id) == False, "Third request should be denied"

    # Wait for window to reset (slightly more than 1 second)
    time.sleep(1.1)

    # Now requests should be allowed again
    assert limiter.is_allowed(session_id) == True, "Request after reset should be allowed"
    assert limiter.is_allowed(session_id) == True, "Second request after reset should be allowed"
    assert limiter.is_allowed(session_id) == False, "Third request after reset should be denied"


def test_global_rate_limiter():
    """
    Test the global rate limiter instance used in the application.
    """
    from rate_limiter import rate_limiter, check_rate_limit

    session_id = "sess_global123"

    # Test the check_rate_limit function
    for i in range(100):  # Default limit is 100
        assert check_rate_limit(session_id) == True, f"Request {i+1} should be allowed"

    # The 101st should be denied
    assert check_rate_limit(session_id) == False, "101st request should be denied"


if __name__ == "__main__":
    test_rate_limit_implementation()
    test_rate_limit_custom_settings()
    test_rate_limit_window_reset()
    test_global_rate_limiter()

    print("All rate limiting tests passed!")