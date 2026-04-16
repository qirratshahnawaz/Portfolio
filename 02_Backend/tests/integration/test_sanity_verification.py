"""
Verification tests to ensure all Sanity tools properly fetch data from Sanity CMS
and follow the Authoritative Source Mandate.
"""
import pytest
import asyncio
import sys
import os
from unittest.mock import patch, MagicMock

# Add parent directory to path to allow importing from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from tools import get_profile, get_skills, get_projects, search_experience, check_availability
from groq_validator import validate_sanity_query


def test_get_profile_fetches_from_sanity():
    """Verify that get_profile tool fetches data from Sanity CMS"""
    # Mock the query_sanity function to return test data
    with patch('tools.query_sanity') as mock_query:
        test_data = {
            "firstName": "John",
            "lastName": "Doe",
            "headline": "Software Engineer",
            "shortBio": "Experienced developer",
            "email": "john@example.com",
            "phone": "+1234567890",
            "location": "New York",
            "availability": "Available",
            "yearsOfExperience": 5
        }
        mock_query.return_value = test_data

        result = get_profile()

        # Verify the function was called with a GROQ query
        mock_query.assert_called_once()
        query = mock_query.call_args[0][0]  # Get the first argument (the query)

        # Verify the query is a valid GROQ query
        assert "*[_id == \"singleton-profile\"]" in query
        assert validate_sanity_query(query) == True

        # Verify the result contains expected profile information
        assert "Profile Information:" in result
        assert "John Doe" in result
        assert "Software Engineer" in result
        assert "john@example.com" in result


def test_get_skills_fetches_from_sanity():
    """Verify that get_skills tool fetches data from Sanity CMS"""
    with patch('tools.query_sanity') as mock_query:
        test_skills = [
            {"name": "Python", "category": "backend", "proficiency": 90, "yearsOfExperience": 5},
            {"name": "JavaScript", "category": "frontend", "proficiency": 85, "yearsOfExperience": 4}
        ]
        mock_query.return_value = test_skills

        result = get_skills()

        # Verify the function was called with a GROQ query
        mock_query.assert_called_once()
        query = mock_query.call_args[0][0]  # Get the first argument (the query)

        # Verify the query is a valid GROQ query
        assert "*[_type == \"skill\"]" in query
        assert validate_sanity_query(query) == True

        # Verify the result contains expected skill information
        assert "Skills (2 total)" in result
        assert "Python (backend): 90% proficiency" in result
        assert "JavaScript (frontend): 85% proficiency" in result


def test_get_projects_fetches_from_sanity():
    """Verify that get_projects tool fetches data from Sanity CMS"""
    with patch('tools.query_sanity') as mock_query:
        test_projects = [
            {"title": "E-commerce Platform", "description": "Online shopping site", "technologies": ["React", "Node.js"]}
        ]
        mock_query.return_value = test_projects

        result = get_projects()

        # Verify the function was called with a GROQ query
        mock_query.assert_called_once()
        query = mock_query.call_args[0][0]  # Get the first argument (the query)

        # Verify the query is a valid GROQ query
        assert "*[_type == \"project\"]" in query
        assert validate_sanity_query(query) == True

        # Verify the result contains expected project information
        assert "Projects (1 total)" in result
        assert "E-commerce Platform" in result
        assert "Online shopping site" in result
        assert "React, Node.js" in result


def test_search_experience_fetches_from_sanity():
    """Verify that search_experience tool fetches data from Sanity CMS"""
    with patch('tools.query_sanity') as mock_query:
        test_experience = [
            {"company": "Tech Corp", "position": "Software Engineer", "startDate": "2020-01-01", "endDate": "2023-01-01", "description": "Developed software"}
        ]
        mock_query.return_value = test_experience

        result = search_experience()

        # Verify the function was called with a GROQ query
        mock_query.assert_called_once()
        query = mock_query.call_args[0][0]  # Get the first argument (the query)

        # Verify the query is a valid GROQ query
        assert "*[_type == \"experience\"]" in query
        assert validate_sanity_query(query) == True

        # Verify the result contains expected experience information
        assert "Work Experience (1 positions)" in result
        assert "Software Engineer at Tech Corp" in result
        assert "Developed software" in result


def test_check_availability_fetches_from_sanity():
    """Verify that check_availability tool fetches data from Sanity CMS"""
    with patch('tools.query_sanity') as mock_query:
        test_data = {
            "availability": "Available for projects",
            "email": "john@example.com",
            "services": [
                {"title": "Consulting", "description": "Technical consulting", "price": "$100/hour"}
            ]
        }
        mock_query.return_value = test_data

        result = check_availability()

        # Verify the function was called with a GROQ query
        mock_query.assert_called_once()
        query = mock_query.call_args[0][0]  # Get the first argument (the query)

        # Verify the query is a valid GROQ query
        assert "*[_id == \"singleton-profile\"]" in query
        assert validate_sanity_query(query) == True

        # Verify the result contains expected availability information
        assert "Available for projects" in result
        assert "john@example.com" in result
        assert "Consulting: $100/hour" in result


def test_all_tools_use_function_tool_decorator():
    """Verify that all tools use the function_tool decorator as required"""
    from agents import function_tool

    # Check that our functions are properly decorated
    assert hasattr(get_profile, '__wrapped__') or hasattr(get_profile, '_tool_spec')
    assert hasattr(get_skills, '__wrapped__') or hasattr(get_skills, '_tool_spec')
    assert hasattr(get_projects, '__wrapped__') or hasattr(get_projects, '_tool_spec')
    assert hasattr(search_experience, '__wrapped__') or hasattr(search_experience, '_tool_spec')
    assert hasattr(check_availability, '__wrapped__') or hasattr(check_availability, '_tool_spec')


if __name__ == "__main__":
    # Run the tests
    test_get_profile_fetches_from_sanity()
    test_get_skills_fetches_from_sanity()
    test_get_projects_fetches_from_sanity()
    test_search_experience_fetches_from_sanity()
    test_check_availability_fetches_from_sanity()
    test_all_tools_use_function_tool_decorator()
    print("All verification tests passed!")
