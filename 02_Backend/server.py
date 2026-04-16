"""Portfolio AI Twin - ChatKit Server Implementation.
Provides the official protocol handshake for the AI Twin.
"""

from __future__ import annotations
from typing import Any, AsyncIterator
import json
import logging

from chatkit.server import ChatKitServer
from chatkit.agents import AgentContext, simple_to_agent_input, stream_agent_response
from memory_store import MemoryStore
from chatkit.types import ThreadMetadata, ThreadStreamEvent, UserMessageItem
from agents import Runner

# Import your agent creation logic
from agent import create_portfolio_agent, GEMINI_MODEL_NAME

logger = logging.getLogger(__name__)

class PortfolioChatServer(ChatKitServer[dict[str, Any]]):
    """Server implementation that tracks AI Twin sessions."""

    def __init__(self) -> None:
        # Use simple in-memory store for local dev
        self.store = MemoryStore()
        super().__init__(self.store)

    async def respond(
        self,
        thread: ThreadMetadata,
        item: UserMessageItem | None,
        context: dict[str, Any],
    ) -> AsyncIterator[ThreadStreamEvent]:
        """Handle incoming messages and stream the Gemini response."""
        
        # 1. Fetch conversation history
        items_page = await self.store.load_thread_items(
            thread.id,
            after=None,
            limit=50, # Increased limit for better context
            order="desc",
            context=context
        )
        items = list(reversed(items_page.data))
        
        # LOGGING: Track exact order and IDs
        logger.info(f"--- Turn Start for Thread {thread.id} ---")
        for i, itm in enumerate(items):
            role = getattr(itm, 'role', 'unknown')
            text_preview = (itm.text[:30] + "...") if hasattr(itm, 'text') and itm.text else "N/A"
            logger.info(f"History[{i}]: ID={itm.id} ROLE={role} TEXT={text_preview}")

        # 2. Convert to format the Agent understands
        if item:
            logger.info(f"Incoming item ID: {item.id}, Text: '{item.text if hasattr(item, 'text') else 'N/A'}'")
        
        agent_input = await simple_to_agent_input(items)
        
        # 3. Create the Portfolio Agent
        personality = thread.metadata.get("personality", "clear")
        agent = create_portfolio_agent(personality=personality)

        # 4. Prepare Context
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        # 5. Run the Agent
        logger.info(f"Runner start: model={GEMINI_MODEL_NAME}, personality={personality}")
        result = Runner.run_streamed(
            agent,
            agent_input,
            context=agent_context,
        )

        # 6. Stream back to ChatKit UI
        yielded_count = 0
        last_item_id = None
        
        try:
            async for event in stream_agent_response(agent_context, result):
                yielded_count += 1
                
                # Capture the ID of the assistant message we are sending
                if event.type == "thread.item.created" or event.type == "thread.item.updated":
                    last_item_id = event.item.id if hasattr(event, 'item') else last_item_id
                
                if yielded_count % 10 == 0:
                    logger.debug(f"Streaming in progress... yielded {yielded_count} events")
                
                yield event
            
            logger.info(f"--- Turn End: Response finished for ID {last_item_id}. Total events: {yielded_count} ---")
        except Exception as e:
            logger.exception(f"Error during stream_agent_response: {str(e)}")
            # Don't re-raise, maybe we yielded something useful
