import re
from typing import Dict, List, Optional
import logging

# Import optimization validation
from groq_optimizer import validate_groq_optimization

# Set up logging
from logging_config import get_logger
logger = get_logger(__name__)


class GROQQueryValidator:
    """
    Validates GROQ queries to ensure they follow best practices and
    security guidelines for Sanity CMS integration.
    """

    # Dangerous patterns that should be blocked
    DANGEROUS_PATTERNS = [
        r'@\[',  # Attribute access on parent, can be misused
        r'\bparams\.',  # Direct parameter access without validation
        r'\bsecrets?\b',  # References to secrets
        r'\bconfig\b',  # Configuration access
    ]

    # Safe query patterns
    SAFE_PATTERNS = [
        r'\*\[_type\s*==\s*"[^"]+"\]',  # Basic type queries
        r'\*\[_id\s*==\s*"[^"]+"\]',   # ID-based queries
        r'\|\s*order\(',  # Ordering operations
        r'\|\s*limit\(',  # Limit operations
        r'\{[^}]+\}',  # Projection operations
    ]

    def __init__(self):
        self.dangerous_regexes = [re.compile(pattern, re.IGNORECASE) for pattern in self.DANGEROUS_PATTERNS]
        self.safe_regexes = [re.compile(pattern) for pattern in self.SAFE_PATTERNS]

    def validate_query(self, query: str) -> Dict[str, any]:
        """
        Validates a GROQ query and returns validation results.

        Args:
            query: The GROQ query string to validate

        Returns:
            Dictionary with validation results
        """
        result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "is_safe": True
        }

        # Check for dangerous patterns
        for i, dangerous_regex in enumerate(self.dangerous_regexes):
            if dangerous_regex.search(query):
                result["is_valid"] = False
                result["is_safe"] = False
                result["errors"].append(f"Dangerous pattern detected: {self.DANGEROUS_PATTERNS[i]}")

        # Additional validation checks
        validation_results = self._additional_validation(query)
        result["is_valid"] = result["is_valid"] and validation_results["is_valid"]
        result["is_safe"] = result["is_safe"] and validation_results["is_safe"]
        result["errors"].extend(validation_results["errors"])
        result["warnings"].extend(validation_results["warnings"])

        # Log validation results
        if result["is_valid"]:
            logger.info(f"GROQ query validation passed", extra={"query": query[:50] + "..."})
        else:
            logger.warning(f"GROQ query validation failed", extra={
                "query": query[:50] + "...",
                "errors": result["errors"]
            })

        return result

    def _additional_validation(self, query: str) -> Dict[str, any]:
        """Perform additional validation checks on the query."""
        result = {
            "is_valid": True,
            "errors": [],
            "warnings": [],
            "is_safe": True
        }

        # Check for SQL-like injection patterns
        if "/*" in query or "*/" in query:
            result["is_valid"] = False
            result["is_safe"] = False
            result["errors"].append("Comment syntax detected, potential injection attempt")

        # Check for excessive nesting that might indicate complex/unoptimized queries
        nesting_level = 0
        max_nesting = 0
        for char in query:
            if char == '{':
                nesting_level += 1
                max_nesting = max(max_nesting, nesting_level)
            elif char == '}':
                nesting_level -= 1

        if max_nesting > 5:  # Arbitrary threshold for complex queries
            result["warnings"].append(f"High nesting level detected ({max_nesting}), consider simplifying query")

        # Check for potential infinite loops or performance issues
        if query.count('|') > 10:  # Arbitrary threshold
            result["warnings"].append("High number of pipe operations detected, may impact performance")

        # Check that query fetches from Sanity (not hardcoded data)
        if not any(op in query for op in ['*', '_', '[_type', '[_id']):
            result["warnings"].append("Query doesn't appear to fetch from Sanity collections, verify data source")

        # Validate optimization and hardcoded data
        try:
            is_optimized = validate_groq_optimization(query)
            if not is_optimized:
                result["warnings"].append("Query may not follow optimization best practices or contains hardcoded data")
        except Exception as e:
            result["warnings"].append(f"Error validating query optimization: {str(e)}")

        return result


# Global validator instance
groq_validator = GROQQueryValidator()


def validate_sanity_query(query: str) -> bool:
    """
    Validates a Sanity GROQ query for safety and best practices.

    Args:
        query: The GROQ query to validate

    Returns:
        True if query is valid and safe, False otherwise
    """
    validation_result = groq_validator.validate_query(query)
    return validation_result["is_valid"] and validation_result["is_safe"]