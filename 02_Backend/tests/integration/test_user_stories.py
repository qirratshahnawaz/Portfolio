"""
Comprehensive tests to ensure all user stories work independently.
"""
import pytest
import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add parent directory to path to allow importing from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from main import app
from tools import get_profile, get_skills, get_projects, search_experience, check_availability


def test_user_story_1_independent_functionality():
    """
    Test User Story 1: Portfolio Visitor Interacts with AI Assistant
    Goal: Enable visitors to ask questions about portfolio data and receive real-time,
    streaming responses from an AI agent that accesses current data from Sanity CMS
    """
    client = TestClient(app)

    # Mock the agent and Sanity data to test the flow
    with patch('main.create_portfolio_agent') as mock_create_agent, \
         patch('main.SQLiteSession'), \
         patch('tools.query_sanity') as mock_query:

        # Mock a simple response from Sanity
        mock_query.return_value = {
            "firstName": "John",
            "lastName": "Doe",
            "headline": "Software Engineer",
            "email": "john@example.com"
        }

        # Create a session first
        session_response = client.post("/api/create-session", json={"user_id": "visitor_123"})
        assert session_response.status_code == 200
        session_data = session_response.json()
        session_id = session_data["session_id"]
        assert session_id.startswith("sess_")

        # Now test the chat endpoint
        chat_response = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "What is your name?",
            "personality": "clear"
        })

        # Should return a streaming response (status 200 for SSE)
        assert chat_response.status_code == 200
        assert chat_response.headers["content-type"] == "text/event-stream"

        # The flow works: visitor asks question → AI processes → fetches from Sanity → streams response


def test_user_story_2_independent_functionality():
    """
    Test User Story 2: Portfolio Owner Updates Information
    Goal: Ensure visitors asking questions receive updated information immediately
    without any application changes or deployments
    """
    client = TestClient(app)

    # This test verifies that the system fetches fresh data from Sanity
    # when questions are asked, so updates to Sanity are immediately reflected

    with patch('tools.query_sanity') as mock_query:
        # First, simulate old data in Sanity
        old_data = {"availability": "Not available"}
        mock_query.return_value = old_data

        result = get_profile()
        assert "Not available" in result

        # Then simulate updated data in Sanity
        updated_data = {"availability": "Available for new projects"}
        mock_query.return_value = updated_data

        result = get_profile()
        assert "Available for new projects" in result

        # This confirms that the system fetches real-time data from Sanity
        # without requiring application changes or deployments


def test_user_story_3_independent_functionality():
    """
    Test User Story 3: AI Assistant Uses Multiple Personality Modes
    Goal: Allow visitors to interact with the AI assistant in different communication styles
    """
    client = TestClient(app)

    # Test that different personality modes can be selected
    with patch('main.create_portfolio_agent') as mock_create_agent, \
         patch('main.SQLiteSession'), \
         patch('tools.query_sanity') as mock_query:

        mock_query.return_value = {"test": "data"}

        # Create a session
        session_response = client.post("/api/create-session", json={})
        session_data = session_response.json()
        session_id = session_data["session_id"]

        # Test crisp personality
        response_crisp = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "Tell me about yourself",
            "personality": "crisp"
        })

        # Test clear personality
        response_clear = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "Tell me about yourself",
            "personality": "clear"
        })

        # Test chatty personality
        response_chatty = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "Tell me about yourself",
            "personality": "chatty"
        })


def test_individual_component_isolation():
    """
    Test that each component can function independently as part of the user stories.
    """
    # Test Sanity tools work independently
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = {"name": "Test"}
        result = get_profile()
        assert "Profile Information:" in result

    # Test session management works independently
    from main import create_session
    from models.session import CreateSessionRequest
    request = CreateSessionRequest(user_id="test_user")
    response = create_session(request)
    assert response.session_id.startswith("sess_")

    # Test that rate limiting works independently
    from rate_limiter import check_rate_limit
    assert check_rate_limit("test_session_123") == True


def test_authoritative_source_mandate_compliance():
    """
    Test that all functionality adheres to the Authoritative Source Mandate:
    All portfolio data originates from and is maintained in Sanity CMS.
    """
    # Verify all tools query Sanity
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = {"test": "data"}

        # All tools should call query_sanity
        get_profile()
        get_skills()
        get_projects()
        search_experience()
        check_availability()

        # Verify that all tools made queries to Sanity
        assert mock_query.call_count == 5  # Called 5 times for the 5 tools


if __name__ == "__main__":
    test_user_story_1_independent_functionality()
    test_user_story_2_independent_functionality()
    test_user_story_3_independent_functionality()
    test_individual_component_isolation()
    test_authoritative_source_mandate_compliance()

    print("All user story independence tests passed!")
