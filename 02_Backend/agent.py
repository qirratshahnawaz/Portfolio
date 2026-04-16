from agents import Agent, set_tracing_disabled, OpenAIChatCompletionsModel
from tools import (
    get_profile,
    get_skills,
    get_projects,
    search_experience,
    check_availability
)
import logging
from openai import AsyncOpenAI
from decouple import config

# Set up logging
from logging_config import get_logger

logger = get_logger(__name__)

# 🛑 CRITICAL: Disable OpenAI tracing
set_tracing_disabled(True)

def init_llm_client() -> AsyncOpenAI:
    """
    Initializes the AsyncOpenAI client with failover support for multiple API keys.
    Checks GEMINI_API_KEY first, then falls back to GEMINI_API_KEY_2 if the first is missing.
    """
    # 1. Try Primary Key
    api_key = config("GEMINI_API_KEY", default="").strip()
    key_source = "Primary (GEMINI_API_KEY)"

    # 2. Fallback to Secondary Key if primary is empty
    if not api_key or api_key.startswith("YOUR_"):
        logger.warning("⚠️ Primary GEMINI_API_KEY missing, trying backup key...")
        api_key = config("GEMINI_API_KEY_2", default="").strip()
        key_source = "Backup (GEMINI_API_KEY_2)"

    base_url = config("GEMINI_BASE_URL", default="https://generativelanguage.googleapis.com/v1beta/openai/")
    
    if not api_key or api_key.startswith("YOUR_"):
        logger.error("❌ No valid GEMINI_API_KEY found! All keys are missing or invalid.")
    else:
        logger.info(f"✅ Using {key_source} (starts with: {api_key[:4]}...)")

    logger.info(f"Initializing AsyncOpenAI client with base_url: {base_url}")
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
    )
    return client

# Gemini Model Definition
GEMINI_MODEL_NAME = "gemini-2.5-flash"

# Initialize global client and model
_client = init_llm_client()
GEMINI_MODEL = OpenAIChatCompletionsModel(
    model=GEMINI_MODEL_NAME,
    openai_client=_client
)

# Personality configurations
PERSONALITY_INSTRUCTIONS = {
    "crisp": """You are a concise AI assistant representing a professional portfolio.

STYLE RULES:
- Use bullet points
- Maximum 2-3 sentences per response
- Be direct and factual
- No elaboration unless asked
    """,

    "clear": """You are a helpful AI assistant representing a professional portfolio.

STYLE RULES:
- Provide clear, balanced explanations
- Be informative but not overwhelming
- Use examples when helpful
- Structure responses logically
    """,

    "chatty": """You are a friendly, conversational AI assistant representing a professional portfolio.

STYLE RULES:
- Be warm and engaging
- Use casual but professional language
- Provide detailed explanations
- Ask follow-up questions when appropriate
- Use analogies and examples
    """
}


def create_portfolio_agent(personality: str = "clear") -> Agent:
    """Create a portfolio agent with specified personality and real-time identity."""

    # 1. Fetch core identity from Sanity to 'prime' the agent's memory
    # We use the tool's logic directly to ensure consistency
    try:
        from tools import get_profile
        # get_profile is a FunctionTool object, call the underlying function .fn()
        profile_info = get_profile.fn() if hasattr(get_profile, 'fn') else get_profile()
    except Exception as e:
        logger.error(f"Error fetching profile for agent initialization: {e}")
        profile_info = "Profile information unavailable."

    base_personality = PERSONALITY_INSTRUCTIONS.get(personality, PERSONALITY_INSTRUCTIONS["clear"])

    full_instructions = f"""{base_personality}

YOUR IDENTITY (FROM SANITY CMS):
{profile_info}

IMPORTANT GUIDELINES:
1. You represent the person described in the identity above. Use this as your 'Background Knowledge'.
2. ALWAYS use the tools to fetch real-time lists of skills, specific projects, or recent experience.
3. Never make up information - if the provided identity or tools don't have it, say you don't know.
4. If asked about availability, services, or pricing, use the check_availability tool.
    """

    agent = Agent(
        name="Portfolio AI Assistant",
        instructions=full_instructions,
        model=GEMINI_MODEL,
        tools=[
            get_profile,
            get_skills,
            get_projects,
            search_experience,
            check_availability
        ]
    )

    logger.debug(f"Agent full instructions: {full_instructions}")
    logger.info(f"Portfolio agent refreshed with Sanity background. Personality: {personality}")
    return agent