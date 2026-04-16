"""
GROQ Query Optimization Validator
Ensures queries follow optimization strategy and avoid hardcoded data
"""
import re
from typing import Dict, List, Tuple


class GROQOptimizer:
    """
    Validates and optimizes GROQ queries to ensure they follow best practices
    and avoid hardcoded data as required by the Authoritative Source Mandate.
    """

    def __init__(self):
        # Patterns that indicate potential issues
        self.hardcoded_data_patterns = [
            r'"[^"]*"(?=\s*(==|!=|contains|in)\s*"[^"]*")',  # String comparisons that might be hardcoded
            r'\{[^}]*"[^"]*\s*:\s*"[^"]*"[^}]*\}',  # Object literals with hardcoded values
        ]

        # Optimization patterns
        self.optimization_patterns = {
            'projection': r'\{[^}]+\}',  # Field projection
            'filter': r'\[([^\[\]]*==[^\[\]]*|_type\s*==\s*"[^"]*")\]',  # Type or field filters
            'ordering': r'\|\s*order\(',  # Ordering operations
            'limiting': r'\|\s*limit\(',  # Limiting operations
        }

    def validate_query_optimization(self, query: str) -> Dict[str, any]:
        """
        Validates that a GROQ query follows optimization strategy and doesn't contain hardcoded data.

        Args:
            query: The GROQ query to validate

        Returns:
            Dictionary with validation results
        """
        result = {
            "is_optimized": True,
            "has_hardcoded_data": False,
            "optimization_issues": [],
            "optimization_suggestions": []
        }

        # Check for hardcoded data patterns
        for pattern in self.hardcoded_data_patterns:
            if re.search(pattern, query):
                result["has_hardcoded_data"] = True
                result["is_optimized"] = False
                result["optimization_issues"].append("Potential hardcoded data detected in query")

        # Check for basic optimization patterns
        if not re.search(self.optimization_patterns['projection'], query):
            result["optimization_suggestions"].append("Consider using field projection to limit data transfer")

        if not re.search(self.optimization_patterns['filter'], query):
            result["optimization_suggestions"].append("Consider adding filters to reduce result set size")

        # Check for potentially inefficient patterns
        if query.count('*') > 1:
            result["optimization_issues"].append("Multiple wildcard selections may be inefficient")

        if '[0]' in query and 'order(' not in query:
            result["optimization_suggestions"].append("Consider ordering before selecting first item")

        return result

    def optimize_query(self, query: str) -> Tuple[str, List[str]]:
        """
        Provides optimization suggestions for a GROQ query.

        Args:
            query: The GROQ query to optimize

        Returns:
            Tuple of (optimized_query, suggestions_list)
        """
        suggestions = []
        optimized_query = query

        # Add field projection if not present and query is selecting all fields
        if '{' not in query and '*[_type' in query:
            # This is a simple heuristic - in practice you'd want to know the schema
            suggestions.append("Consider adding field projection to reduce payload size")

        # Check for missing filters on common fields
        if '*[0]' in query or '*[_id' in query:
            if '_type' not in query:
                suggestions.append("Consider filtering by _type for better performance")

        return optimized_query, suggestions


# Global optimizer instance
groq_optimizer = GROQOptimizer()


def validate_groq_optimization(query: str) -> bool:
    """
    Validates that a GROQ query follows optimization strategy and avoids hardcoded data.

    Args:
        query: The GROQ query to validate

    Returns:
        True if query is optimized and doesn't contain hardcoded data, False otherwise
    """
    validation_result = groq_optimizer.validate_query_optimization(query)
    return validation_result["is_optimized"] and not validation_result["has_hardcoded_data"]