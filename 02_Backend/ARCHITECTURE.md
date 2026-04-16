# Unified Portfolio Agent Architecture

## Overview
The Unified Portfolio Agent is a web application that provides real-time chat interface using ChatKit UI, integrates with Sanity CMS for portfolio data, and uses FastAPI backend with OpenAI Agent SDK. The system implements Server-Sent Events (SSE) for streaming responses, enforces tool-based data access to Sanity CMS via GROQ queries, and maintains conversation history with SQLite session management.

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│            Next.js Frontend (ChatKit UI)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │   ChatKit React Component                        │  │
│  │   - Beautiful UI                                 │  │
│  │   - Streaming support                            │  │
│  │   - All ChatKit features                         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTP/SSE
                       ▼
┌────────────────────────────────────────────────────────┐
│         FastAPI Backend (Python)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OpenAI Agent SDK                                │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  Agent with Tools                          │  │  │
│  │  │  - get_profile()                           │  │  │
│  │  │  - get_skills()                            │  │  │
│  │  │  - get_projects()                          │  │  │
│  │  │  - search_experience()                     │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Session Management (SQLite)                     │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────────┘
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│              Sanity CMS (API)                           │
│  - Profile Data                                         │
│  - Skills, Projects, Experience                         │
│  - Real-time GROQ queries                               │
└────────────────────────────────────────────────────────┘
```

## Components

### Backend Components
- **main.py**: FastAPI application with CORS, session management, and chat endpoints
- **agent.py**: Portfolio agent with multiple personality modes (crisp, clear, chatty)
- **tools.py**: Sanity query tools with GROQ queries for profile, skills, projects, experience, and availability
- **sanity_client.py**: Sanity CMS client with GROQ optimization and validation
- **models/session.py**: Pydantic models for API requests/responses
- **logging_config.py**: Structured JSON logging setup
- **rate_limiter.py**: Token bucket algorithm implementation for rate limiting
- **groq_validator.py**: GROQ query validation system
- **groq_optimizer.py**: GROQ query optimization validation
- **cache_config.py**: Cache management for Sanity CDN optimization

### Frontend Components
- **components/chat/Chat.tsx**: ChatKit UI integration with streaming
- **components/chat/ChatWrapper.tsx**: Sanity data integration

## API Contracts

### Session Management
- `POST /api/create-session`: Creates a new chat session
  - Request: `{"user_id": string?}`
  - Response: `{"session_id": string, "client_secret": string, "expires_at": integer}`

### Chat Interface
- `POST /api/chat`: Handles chat messages with streaming response
  - Request: `{"session_id": string, "message": string, "personality": "crisp|clear|chatty"}`
  - Response: Server-Sent Events stream with format:
    - `data: {"type": "content.delta", "delta": "text"}`
    - `data: {"type": "tool.call", "tool_name": "tool_name"}`
    - `data: {"type": "error", "error": "error_message"}`
    - `data: [DONE]`

### Session History
- `GET /api/session/{session_id}/history`: Gets conversation history
- `DELETE /api/session/{session_id}`: Clears conversation history

## Data Flow

1. User initiates chat through frontend
2. Frontend creates session via `/api/create-session`
3. User sends message via ChatKit to `/api/chat`
4. Backend validates session and rate limit
5. Backend creates agent with specified personality
6. Agent processes message and calls appropriate tools
7. Tools query Sanity CMS using GROQ queries
8. Results streamed back to frontend via SSE
9. Conversation history stored in SQLite

## Security & Performance

### Security
- Session IDs and client secrets follow secure generation patterns
- Rate limiting at 100 requests/hour per session
- GROQ query validation to prevent injection
- Input validation on all endpoints

### Performance
- Sanity CDN usage for faster reads
- GROQ query optimization
- Streaming responses for real-time experience
- Caching strategies for frequently accessed data

## Authoritative Source Mandate Compliance

All portfolio data originates from Sanity CMS:
- Tools only access data through dedicated functions that query Sanity
- No hardcoded or cached data in responses
- Real-time data fetching from Sanity
- Validation that all data comes from Sanity CMS