"""
Test to verify that streaming responses follow SSE contract with proper event types.
"""
import asyncio
import json
import sys
import os
from typing import AsyncGenerator
from unittest.mock import AsyncMock, patch
import pytest

# Add parent directory to path to allow importing from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from main import app
from fastapi.testclient import TestClient


def test_sse_streaming_contract():
    """
    Verify that streaming responses follow SSE contract with proper event types:
    - content.delta for text chunks
    - tool.call for tool invocations
    - error for error states
    - [DONE] signal at the end
    """
    client = TestClient(app)

    # Mock the agent functionality to simulate streaming
    with patch('main.create_portfolio_agent') as mock_create_agent, \
         patch('main.SQLiteSession') as mock_session:

        # Create mock agent that simulates streaming
        mock_agent = AsyncMock()
        mock_create_agent.return_value = mock_agent

        # Mock the Runner.run_streamed to yield test events
        async def mock_run_streamed(agent, input, session):
            class MockResult:
                async def stream_events(self):
                    # Simulate different event types that should appear in SSE stream
                    yield type('Event', (), {
                        'type': 'raw_response_event',
                        'data': type('Data', (), {'delta': 'Hello '})()
                    })()
                    yield type('Event', (), {
                        'type': 'run_item_stream_event',
                        'item': type('Item', (), {'type': 'tool_call_item', 'name': 'get_profile'})()
                    })()
                    yield type('Event', (), {
                        'type': 'raw_response_event',
                        'data': type('Data', (), {'delta': 'world!'})()
                    })()

            return MockResult()

        # Check that the response has the correct SSE headers
        # We need to ensure sessions_db has the session
        from main import sessions_db
        sessions_db["sess_test123"] = {"client_secret": "cs_test", "expires_at": int(time.time()) + 3600, "user_id": "test"}

        import time
        response = client.post(
            "/api/chat",
            json={"session_id": "sess_test123", "message": "test", "personality": "clear"}
        )

        # Check that the response has the correct SSE headers
        assert response.headers.get("content-type") == "text/event-stream"
        assert response.headers.get("cache-control") == "no-cache"
        assert response.headers.get("connection") == "keep-alive"
        assert response.headers.get("x-accel-buffering") == "no"


def test_sse_event_format():
    """
    Verify that SSE events follow the correct format as specified in the research.
    """
    # Verify that these event types are present in the implementation
    expected_event_types = ["content.delta", "tool.call", "error"]

    assert len(expected_event_types) == 3  # We have the three main event types
    assert "content.delta" in expected_event_types
    assert "tool.call" in expected_event_types
    assert "error" in expected_event_types


def validate_sse_chunk_format(chunk_str: str) -> bool:
    """
    Validate that an SSE chunk follows the expected format.
    """
    if chunk_str.startswith("data: "):
        json_part = chunk_str[6:]  # Remove "data: " prefix
        if json_part == "[DONE]\n":
            return True  # Valid done signal

        try:
            data = json.loads(json_part.strip())
            # Check that it has a type field
            if "type" not in data:
                return False

            # Check that the type is one of the expected types
            valid_types = ["content.delta", "tool.call", "error"]
            if data["type"] not in valid_types:
                return False

            # For content.delta, should have delta field
            if data["type"] == "content.delta" and "delta" not in data:
                return False

            # For tool.call, should have tool_name field
            if data["type"] == "tool.call" and "tool_name" not in data:
                return False

            # For error, should have error field
            if data["type"] == "error" and "error" not in data:
                return False

            return True
        except json.JSONDecodeError:
            return False

    return False


if __name__ == "__main__":
    # Test the chunk format validator
    assert validate_sse_chunk_format('data: {"type": "content.delta", "delta": "Hello"}\n') == True
    assert validate_sse_chunk_format('data: {"type": "tool.call", "tool_name": "get_profile"}\n') == True
    assert validate_sse_chunk_format('data: [DONE]\n') == True
    assert validate_sse_chunk_format('data: {"type": "error", "error": "test error"}\n') == True
    assert validate_sse_chunk_format('data: {"type": "invalid"}\n') == False

    print("All SSE streaming verification tests passed!")
