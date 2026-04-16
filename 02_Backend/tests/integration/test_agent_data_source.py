"""
Test to verify that all agent skills return data from Sanity rather than fabricated information.
This ensures compliance with the Authoritative Source Mandate.
"""
import pytest
from unittest.mock import patch
import sys
import os

# Add parent directory to path to allow importing from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from tools import get_profile, get_skills, get_projects, search_experience, check_availability


def test_agent_skills_use_sanity_data_not_fabricated():
    """
    Verify that agent skills return data from Sanity CMS rather than fabricated information.
    This test ensures compliance with the Authoritative Source Mandate.
    """
    # Test get_profile function
    with patch('tools.query_sanity') as mock_query:
        # Mock real data from Sanity
        mock_data = {
            "firstName": "John",
            "lastName": "Doe",
            "headline": "Software Engineer",
            "shortBio": "Experienced software developer",
            "email": "john@example.com",
            "availability": "Available"
        }
        mock_query.return_value = mock_data

        result = get_profile()

        # Verify it uses the real data from mock, not fabricated data
        assert "John Doe" in result
        assert "Software Engineer" in result
        assert "john@example.com" in result
        assert mock_query.called  # Ensure query_sanity was actually called

        # Verify the query is appropriate for fetching profile
        called_query = mock_query.call_args[0][0]
        assert "singleton-profile" in called_query


    # Test get_skills function
    with patch('tools.query_sanity') as mock_query:
        # Mock real skills data from Sanity
        mock_data = [
            {"name": "Python", "category": "backend", "proficiency": 90, "yearsOfExperience": 5},
            {"name": "JavaScript", "category": "frontend", "proficiency": 85, "yearsOfExperience": 4}
        ]
        mock_query.return_value = mock_data

        result = get_skills()

        # Verify it uses the real data from mock, not fabricated data
        assert "Python" in result
        assert "JavaScript" in result
        assert "backend" in result
        assert "frontend" in result
        assert mock_query.called  # Ensure query_sanity was actually called

        # Verify the query is appropriate for fetching skills
        called_query = mock_query.call_args[0][0]
        assert "_type == \"skill\"" in called_query


    # Test get_projects function
    with patch('tools.query_sanity') as mock_query:
        # Mock real projects data from Sanity
        mock_data = [
            {"title": "E-commerce Platform", "description": "Online shopping solution", "technologies": ["React", "Node.js"]},
            {"title": "Task Manager", "description": "Productivity application", "technologies": ["Vue.js", "Express"]}
        ]
        mock_query.return_value = mock_data

        result = get_projects()

        # Verify it uses the real data from mock, not fabricated data
        assert "E-commerce Platform" in result
        assert "Task Manager" in result
        assert "React, Node.js" in result
        assert "Vue.js, Express" in result
        assert mock_query.called  # Ensure query_sanity was actually called

        # Verify the query is appropriate for fetching projects
        called_query = mock_query.call_args[0][0]
        assert "_type == \"project\"" in called_query


    # Test search_experience function
    with patch('tools.query_sanity') as mock_query:
        # Mock real experience data from Sanity
        mock_data = [
            {"company": "Tech Corp", "position": "Senior Developer", "startDate": "2020-01-01", "endDate": "2023-01-01", "description": "Led development team"}
        ]
        mock_query.return_value = mock_data

        result = search_experience()

        # Verify it uses the real data from mock, not fabricated data
        assert "Tech Corp" in result
        assert "Senior Developer" in result
        assert "Led development team" in result
        assert mock_query.called  # Ensure query_sanity was actually called

        # Verify the query is appropriate for fetching experience
        called_query = mock_query.call_args[0][0]
        assert "_type == \"experience\"" in called_query


    # Test check_availability function
    with patch('tools.query_sanity') as mock_query:
        # Mock real availability data from Sanity
        mock_data = {
            "availability": "Available for freelance projects",
            "email": "contact@example.com",
            "services": [
                {"title": "Consulting", "description": "Technical consulting", "price": "$100/hour"}
            ]
        }
        mock_query.return_value = mock_data

        result = check_availability()

        # Verify it uses the real data from mock, not fabricated data
        assert "Available for freelance projects" in result
        assert "contact@example.com" in result
        assert "Consulting" in result
        assert mock_query.called  # Ensure query_sanity was actually called

        # Verify the query is appropriate for fetching availability
        called_query = mock_query.call_args[0][0]
        assert "singleton-profile" in called_query


def test_agent_skills_handle_empty_sanity_responses():
    """
    Verify that agent skills handle empty Sanity responses gracefully without fabricating data.
    """
    # Test get_profile with empty response
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = None
        result = get_profile()
        assert "not available" in result.lower()
        assert mock_query.called


    # Test get_skills with empty response
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = None
        result = get_skills()
        assert "not found" in result.lower()
        assert mock_query.called


    # Test get_projects with empty response
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = None
        result = get_projects()
        assert "not found" in result.lower()
        assert mock_query.called


    # Test search_experience with empty response
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = None
        result = search_experience()
        assert "not found" in result.lower()
        assert mock_query.called


    # Test check_availability with empty response
    with patch('tools.query_sanity') as mock_query:
        mock_query.return_value = None
        result = check_availability()
        assert "not available" in result.lower()
        assert mock_query.called


if __name__ == "__main__":
    # Run the tests
    test_agent_skills_use_sanity_data_not_fabricated()
    test_agent_skills_handle_empty_sanity_responses()
    print("All agent data source verification tests passed!")
