import logging
import json
from datetime import datetime
from typing import Dict, Any

try:
    from rich.logging import RichHandler
    from rich.console import Console
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False

def setup_logging():
    """Set up beautiful logging for the AI Twin"""
    if RICH_AVAILABLE:
        logging.basicConfig(
            level=logging.DEBUG,
            format="%(message)s",
            datefmt="[%X]",
            handlers=[RichHandler(rich_tracebacks=True, show_path=False)]
        )
    else:
        logging.basicConfig(
            level=logging.DEBUG,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    
    # Silence noisy loggers
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("openai").setLevel(logging.DEBUG)  # 🔍 Troubleshooting LLC
    logging.getLogger("agents").setLevel(logging.DEBUG)  # 🔍 Troubleshooting Agent
    logging.getLogger("chatkit").setLevel(logging.DEBUG)
    logging.getLogger("httpx").setLevel(logging.INFO)

    return logging.getLogger("AI-Twin")


# Initialize logging
logger = setup_logging()

def get_logger(name: str) -> logging.Logger:
    """Get a logger with the specified name"""
    return logging.getLogger(name)